import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';
import sharp from 'sharp';

export class UploadService {
    private s3Client: S3Client;
    private bucketName: string;
    private publicUrl: string;

    constructor() {
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
        this.bucketName = process.env.R2_BUCKET_NAME!;
        this.publicUrl = process.env.R2_PUBLIC_URL!;

        // Configuração do Cliente S3 apontando para o Cloudflare R2
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            },
        });
    }

    // Recebe o arquivo que o multer interceptou
    async uploadFile(file: Express.Multer.File, folder: string = 'geral'): Promise<string> {
        // Gera um nome único para não sobrescrever arquivos
        const fileHash = crypto.randomBytes(16).toString('hex');
        
        let finalBuffer = file.buffer;
        let finalMimeType = file.mimetype;
        let finalExtension = path.extname(file.originalname);
        
        let originalBaseName = path.basename(file.originalname, finalExtension);
        // Normaliza para remover acentos e caracteres especiais, mantendo o nome legível
        let safeOriginalName = originalBaseName
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9\-_]/g, '_');

        // Otimização: se for imagem, converte para webp (ignorando SVG)
        if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
            finalBuffer = await sharp(file.buffer)
                .webp({ quality: 80 })
                .toBuffer();
            finalMimeType = 'image/webp';
            finalExtension = '.webp';
        }

        const fileName = `${folder}/${fileHash}/${safeOriginalName}${finalExtension}`; // Ex: users/hash/nome.webp

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileName,
            Body: finalBuffer,
            ContentType: finalMimeType,
        });

        // Envia o arquivo para o Cloudflare R2
        await this.s3Client.send(command);

        // Retorna a URL pública pronta para ser salva no PostgreSQL
        return `${this.publicUrl}/${fileName}`;
    }

    // Deleta um arquivo fisicamente do Cloudflare R2
    async deleteFile(fileUrl: string): Promise<void> {
        if (!fileUrl) return;
        try {
            // Verifica se a URL pertence ao nosso bucket
            if (!fileUrl.startsWith(this.publicUrl)) return;
            
            const key = fileUrl.replace(`${this.publicUrl}/`, '');
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error) {
            console.error(`Erro ao deletar o arquivo ${fileUrl} do R2:`, error);
        }
    }
}