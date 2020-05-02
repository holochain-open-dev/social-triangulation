import { GraphQlSchemaModule } from '@uprtcl/graphql';
import { MicroModule, i18nextModule } from '@uprtcl/micro-orchestrator';
import { HolochainConnectionModule, createHolochainProvider } from '@uprtcl/holochain-provider';
import { ProfilesModule } from 'holochain-profiles';
import gql from 'graphql-tag';

var en = {
	
};

const SocialTriangulationBindings = {
    SocialTriangulationBindings: "holochain-social-triangulation-provider"
};

const socialTriangulationTypeDefs = gql `
  extend type Mutation {
    vouchForAgent(agentId: ID!): Boolean!
  }

  extend type Agent {
    numVouches: Int!
    isInitialMember: Boolean!
  }

  extend type Query {
    minVouches: Int!
  }
`;

const resolvers = {
    Mutation: {
        async vouchForAgent(_, { agentId }, { container }) {
            const socialTriangulationProvider = container.get(SocialTriangulationBindings.SocialTriangulationBindings);
            await socialTriangulationProvider.call('vouch_for', {
                agent_address: agentId,
            });
            return true;
        },
    },
    Query: {
        async minVouches(_, __, { container }) {
            const socialTriangulationProvider = container.get(SocialTriangulationBindings.SocialTriangulationBindings);
            const settings = await socialTriangulationProvider.call('get_setting', {});
            return settings.split('Minimum_Required_Vouch:')[1];
        },
    },
    Agent: {
        async isInitialMember(parent, _, { container }) {
            const socialTriangulationProvider = container.get(SocialTriangulationBindings.SocialTriangulationBindings);
            const settings = await socialTriangulationProvider.call('get_setting', {});
            return settings.includes(parent.id);
        },
        async numVouches(parent, _, { container }) {
            const socialTriangulationProvider = container.get(SocialTriangulationBindings.SocialTriangulationBindings);
            const numVouches = await socialTriangulationProvider.call('vouch_count_for', {
                agent_address: parent.id,
            });
            return parseInt(numVouches);
        },
    },
};

class SocialTriangulationModule extends MicroModule {
    constructor(instance) {
        super();
        this.instance = instance;
        this.dependencies = [HolochainConnectionModule.id, ProfilesModule.id];
    }
    async onLoad(container) {
        const socialTriangulationProvider = createHolochainProvider(this.instance, 'social-triangulation');
        container
            .bind(SocialTriangulationBindings.SocialTriangulationBindings)
            .to(socialTriangulationProvider);
    }
    get submodules() {
        return [
            new GraphQlSchemaModule(socialTriangulationTypeDefs, resolvers),
            new i18nextModule('social-triangulation', { en: en }),
        ];
    }
}
SocialTriangulationModule.id = 'holochain-social-triangulation-module';
SocialTriangulationModule.bindings = SocialTriangulationBindings;

const VOUCH_FOR_AGENT = gql `
  mutation VouchForAgent($agentId: ID!) {
    vouchForAgent(agentId: $agentId)
  }
`;

export { SocialTriangulationModule, VOUCH_FOR_AGENT };
//# sourceMappingURL=hc-social-triangulation.es5.js.map
