import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

/**
 * Interface definition for Storage Service (Dependency Inversion Principle)
 * Allows easy mocking or swapping of storage providers.
 */
export interface IStorageService {
  uploadFile(file: File, fileName: string): Promise<string>;
}

export class AzureStorageService implements IStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containerName: string;

  constructor(connectionString: string | undefined, containerName: string) {
    this.containerName = containerName;
    
    // Validate connection string to prevent crash on placeholders
    if (connectionString && !connectionString.includes("<your_account_name>") && !connectionString.includes("...")) {
      try {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      } catch {
        console.warn("Invalid Azure Storage Connection String.");
      }
    } else {
      console.warn("Azure Storage Connection String is missing or placeholder.");
    }
  }

  private async getContainerClient(): Promise<ContainerClient> {
    if (!this.blobServiceClient) {
        throw new Error("Storage service not initialized");
    }
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    await containerClient.createIfNotExists();
    return containerClient;
  }

  async uploadFile(file: File, fileName: string): Promise<string> {
    try {
        const containerClient = await this.getContainerClient();
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        
        const arrayBuffer = await file.arrayBuffer();
        await blockBlobClient.uploadData(arrayBuffer, {
            blobHTTPHeaders: { blobContentType: file.type }
        });

        return blockBlobClient.url;
    } catch (error) {
        console.error("Azure Upload Error:", error);
        throw new Error("Failed to upload file to storage");
    }
  }
}

// Singleton Instance
export const storageService = new AzureStorageService(
    process.env.AZURE_STORAGE_CONNECTION_STRING,
    "dexterix-admin-uploads"
);
