import { BlobServiceClient } from "@azure/storage-blob";

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

export const blobServiceClient = AZURE_STORAGE_CONNECTION_STRING 
    ? BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
    : null;

export const containerName = "dexterix-admin-uploads";

export async function uploadToAzure(file: File | Blob, fileName: string) {
    if (!blobServiceClient) throw new Error("Azure Storage not configured");
    
    // Ensure container exists
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    // Convert File/Blob to ArrayBuffer since uploadData accepts that or Buffer
    const arrayBuffer = await file.arrayBuffer();
    
    await blockBlobClient.uploadData(arrayBuffer, {
        blobHTTPHeaders: { blobContentType: file.type }
    });

    return blockBlobClient.url;
}
