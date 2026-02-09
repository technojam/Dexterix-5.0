import { CosmosClient, Container, Database } from "@azure/cosmos";
import "server-only";

export interface IMember {
  name: string;
  email: string;
  phone: string;
  gender: string;
  course: string;
  year: string;
  college: string;
  isLeader?: boolean;
}

export interface ITeam {
  id: string;
  name: string;
  leaderName: string;
  leaderEmail: string;
  password?: string; // Optional for simple auth if ever needed
  members: IMember[]; 
  phone?: string;
  college?: string;
  year?: string;
  problemStatementId?: string;
  score?: number; 
  checkedIn?: boolean; // Check-in status
  tableNumber?: string; // Assigned table
}

export interface IGlobalSettings {
  id: "global_settings"; // Singleton ID
  registrationEnabled?: boolean; // Master toggle
  registrationOpenTime: string | null; // ISO Date
  registrationCloseTime: string | null; // ISO Date
  totalTables?: number; // Total assignable tables
  volunteersCanEditTeams?: boolean;
  showHardware: boolean;
  showSoftware: boolean;
  leaderboardColumns?: {
    rank: boolean;
    team: boolean;
    teamId: boolean;
    problem: boolean;
    score: boolean;
  };
}

export interface IProblemStatement {
  id: string; // Unique ID (e.g., PS01)
  title: string;
  description: string;
  maxLimit: number;
  category: "Hardware" | "Software" | "Other";
  domain?: string; // New: e.g. "AI/ML", "Web3"
  teamCount?: number; 
}

export interface ICosmosService {
  getTeamsContainer(): Promise<Container>;
  getProblemStatementsContainer(): Promise<Container>;
  getSettingsContainer(): Promise<Container>; // New
  
  // Helper methods
  getTeam(id: string): Promise<ITeam | null>;
  createTeam(team: ITeam): Promise<ITeam>;
  updateTeam(team: ITeam): Promise<ITeam>;
  
  getProblemStatement(id: string): Promise<IProblemStatement | null>;
  getAllProblemStatements(): Promise<IProblemStatement[]>;
  createProblemStatement(ps: IProblemStatement): Promise<IProblemStatement>;

  getAllTeams(): Promise<ITeam[]>;
  deleteTeam(id: string): Promise<void>;
  deleteAllTeams(): Promise<void>;

  getGlobalSettings(): Promise<IGlobalSettings>;
  updateGlobalSettings(settings: Partial<IGlobalSettings>): Promise<IGlobalSettings>;
}

export class AzureCosmosService implements ICosmosService {
  private client: CosmosClient | null = null;
  private databaseId: string;
  private databasePromise: Promise<Database> | null = null;

  constructor() {
    this.databaseId = process.env.COSMOS_DATABASE_NAME || "dexterix";
    
    // Check if placeholders or invalid content exist
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    
    // Simple validator to ensure it looks like a URL
    const isValidEndpoint = endpoint && endpoint.startsWith("https://") && !endpoint.includes("<your-account>");

    if (isValidEndpoint && key && !key.includes("<your-primary-key>")) {
      try {
        this.client = new CosmosClient({
          endpoint: endpoint,
          key: key,
        });
      } catch (e) {
        console.warn("Failed to initialize CosmosClient with provided config:", e);
      }
    } else {
      console.warn("Cosmos DB Credentials missing or placeholders used. DB Service disabled.");
    }
  }

  // Lazy initialization of database and containers
  private async getDatabase(): Promise<Database> {
    if (!this.client) throw new Error("Cosmos Client not initialized");
    if (this.databasePromise) return this.databasePromise;

    this.databasePromise = (async () => {
      const { database } = await this.client!.databases.createIfNotExists({ id: this.databaseId });
      return database;
    })();

    return this.databasePromise;
  }

  async getTeamsContainer(): Promise<Container> {
    const db = await this.getDatabase();
    const { container } = await db.containers.createIfNotExists({ id: "Teams", partitionKey: "/id" });
    return container;
  }

  async getProblemStatementsContainer(): Promise<Container> {
    const db = await this.getDatabase();
    const { container } = await db.containers.createIfNotExists({ id: "ProblemStatements", partitionKey: "/id" });
    return container;
  }

  async getSettingsContainer(): Promise<Container> {
    const db = await this.getDatabase();
    const { container } = await db.containers.createIfNotExists({ id: "Settings", partitionKey: "/id" });
    return container;
  }

  async getTeam(id: string): Promise<ITeam | null> {
    const container = await this.getTeamsContainer();
    try {
      const { resource } = await container.item(id, id).read();
      return resource as ITeam || null;
    } catch {
      return null;
    }
  }

  async createTeam(team: ITeam): Promise<ITeam> {
    const container = await this.getTeamsContainer();
    const { resource } = await container.items.create(team);
    return resource as ITeam;
  }

  async updateTeam(team: ITeam): Promise<ITeam> {
    const container = await this.getTeamsContainer();
    const { resource } = await container.item(team.id, team.id).replace(team);
    return resource as ITeam;
  }

  async getAllTeams(): Promise<ITeam[]> {
    const container = await this.getTeamsContainer();
    const { resources } = await container.items.query("SELECT * FROM c").fetchAll();
    return resources as ITeam[];
  }

  async deleteTeam(id: string): Promise<void> {
    const container = await this.getTeamsContainer();
    await container.item(id, id).delete();
  }

  async deleteAllTeams(): Promise<void> {
    const container = await this.getTeamsContainer();
    // Getting all IDs and deleting them. Efficient for small datasets (<10k). 
    // For large, might need partition deletion or container recreation (slow).
    // Hackathon scale is fine.
    const { resources } = await container.items.query("SELECT c.id FROM c").fetchAll();
    for (const r of resources) {
        await container.item(r.id, r.id).delete();
    }
  }

  async getProblemStatement(id: string): Promise<IProblemStatement | null> {
    const container = await this.getProblemStatementsContainer();
    try {
      const { resource } = await container.item(id, id).read();
      return resource as IProblemStatement || null;
    } catch {
      return null;
    }
  }

  async getAllProblemStatements(): Promise<IProblemStatement[]> {
    const container = await this.getProblemStatementsContainer();
    const { resources } = await container.items.query("SELECT * FROM c").fetchAll();
    return resources as IProblemStatement[];
  }

  async createProblemStatement(ps: IProblemStatement): Promise<IProblemStatement> {
    const container = await this.getProblemStatementsContainer();
    const { resource } = await container.items.create(ps);
    return resource as IProblemStatement;
  }

  async getGlobalSettings(): Promise<IGlobalSettings> {
    const container = await this.getSettingsContainer();
    let resource: IGlobalSettings | undefined;
    try {
        const response = await container.item("global_settings", "global_settings").read();
        resource = response.resource as IGlobalSettings;
    } catch {
        // ignore 404
    }
    
    // Default settings if not found or missing fields
    if (!resource || !resource.leaderboardColumns) {
        const defaults = {
            id: "global_settings",
            registrationEnabled: resource?.registrationEnabled ?? false, // Default false for safety
            registrationOpenTime: resource?.registrationOpenTime || null,
            registrationCloseTime: resource?.registrationCloseTime || null,
            showHardware: resource?.showHardware ?? true,
            showSoftware: resource?.showSoftware ?? true,
            leaderboardColumns: resource?.leaderboardColumns || {
                rank: true,
                team: true,
                teamId: false,
                problem: true,
                score: true
            }
        };

        if (!resource) {
            await container.items.create(defaults as IGlobalSettings);
        } else {
             await container.item("global_settings", "global_settings").replace(defaults);
        }
        return defaults as IGlobalSettings;
    }
    
    return resource;
  }

  async updateGlobalSettings(settings: Partial<IGlobalSettings>): Promise<IGlobalSettings> {
      const container = await this.getSettingsContainer();
      // Read existing to merge
      const existing = await this.getGlobalSettings();
      const merged = { ...existing, ...settings, id: "global_settings" };
      
      const { resource } = await container.item("global_settings", "global_settings").replace(merged);
      return resource as IGlobalSettings;
  }
}

export const cosmosService = new AzureCosmosService();
