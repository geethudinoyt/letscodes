import * as vscode from 'vscode';
import * as crypto from 'crypto';

export class EncryptionManager {
    private algorithm: crypto.CipherGCMTypes = 'aes-256-gcm';
    private keyLength = 32;
    private ivLength = 16;
    private tagLength = 16;

    constructor(private context: vscode.ExtensionContext) {}

    deriveKey(sessionId: string, password?: string): Buffer {
        const secret = password || sessionId;
        return crypto.scryptSync(secret, sessionId, this.keyLength);
    }

    encrypt(data: string, key: Buffer): { encrypted: string; iv: string; tag: string } {
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, key, iv) as crypto.CipherGCM;
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
    }

    decrypt(encrypted: string, key: Buffer, iv: string, tag: string): string {
        const decipher = crypto.createDecipheriv(
            this.algorithm,
            key,
            Buffer.from(iv, 'hex')
        ) as crypto.DecipherGCM;
        
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    generateSecureId(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    hash(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}
