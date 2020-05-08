import { interfaces } from 'inversify';
import { GraphQlSchemaModule } from '@uprtcl/graphql';
import { MicroModule, i18nextModule } from '@uprtcl/micro-orchestrator';
export declare class SocialTriangulationModule extends MicroModule {
    protected instance: string;
    protected lobbyInstance: string;
    protected bridgeId: string;
    static id: string;
    dependencies: string[];
    static bindings: {
        SocialTriangulationProvider: string;
        RemoteBridgeProvier: string;
        BridgeId: string;
    };
    constructor(instance: string, lobbyInstance: string, bridgeId: string);
    onLoad(container: interfaces.Container): Promise<void>;
    get submodules(): (GraphQlSchemaModule | i18nextModule)[];
}
