export interface LinkRedirector {
    ownerId: string;
    originalUrl: string;
    redirectUrl: string;
    redirectType: 301;
    isActive: boolean;
    createdAt?: number;
    updatedAt?: number;
}

export interface LinkRedirectorsList {
    linkRedirectors: LinkRedirector[],
    lastEvaluatedKey: any
}

export interface ILinkRedirectorAdapter {
    createLinkRedirector(linkRedirector: LinkRedirector): Promise<LinkRedirector>;
    updateLinkRedirector(linkRedirector: Partial<LinkRedirector>): Promise<LinkRedirector>;
    deleteLinkRedirector(ownerId: string, originalUrl: string): Promise<void>;
    getLinkRedirector(ownerId: string, originalUrl: string): Promise<LinkRedirector>;
    listLinkRedirectors(ownerId: string, limit: 0, offset: 0): Promise<LinkRedirectorsList>;
}