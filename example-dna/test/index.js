/// NB: The tryorama config patterns are still not quite stabilized.
/// See the tryorama README [https://github.com/holochain/tryorama]
/// for a potentially more accurate example

const path = require("path");
const zome_name = "social-triangulation";
const dna_name = "triangulation";
const {
  Orchestrator,
  Config,
  combine,
  singleConductor,
  localOnly,
  tapeExecutor,
} = require("@holochain/tryorama");

process.on("unhandledRejection", (error) => {
  // Will print "unhandledRejection err is not defined"
  console.error("got unhandledRejection:", error);
});

async function _call(caller, fnName, params, logTest) {
  console.log(
    "<<<<<<<<<<<<<<<  " +
      logTest +
      "  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
  );
  const result = await caller.call(dna_name, zome_name, fnName, params);
  console.log(result);
  console.log(
    "<End>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
  );
  return result;
}
async function show_entry(caller, address, title) {
  console.log(
    "<<<<<<<<<<<<<<<  " +
      title +
      "  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
  );
  const result = await caller.call(dna_name, zome_name, "get_entry", {
    address: address,
  });

  //console.log(title);
  console.log(result);
  console.log(
    "<End>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
  );
}
const orchestrator = new Orchestrator({
  middleware: combine(
    // use the tape harness to run the tests, injects the tape API into each scenario
    // as the second argument
    tapeExecutor(require("tape")),

    // specify that all "players" in the test are on the local machine, rather than
    // on remote machines
    localOnly

    // squash all instances from all conductors down into a single conductor,
    // for in-memory testing purposes.
    // Remove this middleware for other "real" network types which can actually
    // send messages across conductors
  ),
});

const dnaPath = path.join(__dirname, "../dist/example-dna.dna.json");

const dna = Config.dna(dnaPath, "triangulation");
const aliceConfig = Config.gen(
  [
    {
      id: "triangulation",
      agent: {
        id: "hc-alice",
        name: "alice",
        public_address:
          "HcSCjcNW9C6k8U6vofmICxgMV8e5pdmsk5aeca9ejZHvsagae8hprf6EWXyaoni",
        keystore_file: "./alice.keystore",
      },
      dna,
    },
  ],
  {
    network: {
      type: "sim2h",
      sim2h_url: "ws://localhost:9000",
    },
    // logger: Config.logger({ type: "error" }),
  }
);

const bobConfig = Config.gen(
  [
    {
      id: "triangulation",
      agent: {
        id: "hc-bob",
        name: "alice",
        public_address:
          "HcSciGq3EHu4Dppzfr5KS8N4Bx49t5sNyayFzmWOJabs5cr5jzBQ5rsM5S68t3r",
        keystore_file: "./bob.keystore",
      },
      dna,
    },
  ],
  {
    network: {
      type: "sim2h",
      sim2h_url: "ws://localhost:9000",
    },
    //logger: Config.logger({ type: "error" }),
  }
);

const tomConfig = Config.gen(
  [
    {
      id: "triangulation",
      agent: {
        id: "hc-tom",
        name: "tom",
        public_address:
          "HcSCIcByHfX3rpbsgwnzI6MBUWW8kfnv4dvT9RTXbYxadnt7BHcPKHjQtd4gcca",
        keystore_file: "./tom.keystore",
      },
      dna,
    },
  ],
  {
    network: {
      type: "sim2h",
      sim2h_url: "ws://localhost:9000",
    },
    // logger: Config.logger({ type: "error" }),
  }
);
///////////////////////////////////////////////// Test Scenario 1

// const stats = orchestrator.run();
// // t.equal(stats.successes, 0);
// // t.equal(stats.errors.length, 1);
// console.log(stats.errors[0].error);

// orchestrator.registerScenario(
//   "Scenario 1: Alice and Bob are Admin users and can join the DNA without vouches. Tom can not since he does n't have voucehs.",

//   async (s, t) => {
//     const { alice, bob, tom } = await s.players(
//       {
//         alice: aliceConfig,
//         bob: bobConfig,
//         tom: tomConfig,
//       },
//       true
//     );
//     const aliceAddress = alice.instance(dna_name).agentAddress;
//     const bobAddress = bob.instance(dna_name).agentAddress;
//     const tomAddress = tom.instance(dna_name).agentAddress;
//     await s.consistency();
//   }
// );

///////////////////////////////////////////////// Test Scenario 2

// orchestrator.registerScenario(
//   "Scenario 2: Bob can join the DNA after receving 2 vouces",
//   async (s, t) => {
//     const { alice, bob } = await s.players(
//       { alice: aliceConfig, bob: bobConfig },
//       true
//     );
//     const tom_address =
//       "HcSCIcByHfX3rpbsgwnzI6MBUWW8kfnv4dvT9RTXbYxadnt7BHcPKHjQtd4gcca";
//     var alice_vouces = await _call(
//       alice,
//       "vouch_for",
//       {
//         agent_address: tom_address,
//       },
//       "Alcie vouces for Tom"
//     );
//     await s.consistency();

//     t.ok(alice_vouces.Ok);

//     var bob_vouces = await _call(
//       bob,
//       "vouch_for",
//       {
//         agent_address: tom_address,
//       },
//       "Bob vouces for Tom"
//     );
//     await s.consistency();

//     t.ok(bob_vouces.Ok);

//     const tom = await s.players({ tom: tomConfig }, true);
//     await s.consistency();
//     console.log("tom instance by hedayat");
//   }
// );

// orchestrator.registerScenario(
//   "Scenario 3: Tom cannot join DAN after receving 1 vouce",
//   async (s, t) => {
//     const { alice, bob } = await s.players(
//       { alice: aliceConfig, bob: bobConfig },
//       true
//     );
//     const tom_address =
//       "HcSCIcByHfX3rpbsgwnzI6MBUWW8kfnv4dvT9RTXbYxadnt7BHcPKHjQtd4gcca";
//     var alice_vouces = await _call(
//       alice,
//       "vouch_for",
//       {
//         agent_address: tom_address,
//       },
//       "Alcie vouces for Tom"
//     );
//     await s.consistency();

//     t.ok(alice_vouces.Ok);

//     const tom = await s.players({ tom: tomConfig }, true);
//     await s.consistency();
//     console.log("tom instance by hedayat");
//   }
// );

orchestrator.registerScenario(
  "Scenario 4: Double vouches is ignored",
  async (s, t) => {
    const { alice, bob } = await s.players(
      { alice: aliceConfig, bob: bobConfig },
      true
    );
    const tom_address =
      "HcSCIcByHfX3rpbsgwnzI6MBUWW8kfnv4dvT9RTXbYxadnt7BHcPKHjQtd4gcca";

    // Alice Can Vouch Once fro Tom ************************************************
    var alice_vouces_firstTime = await _call(
      alice,
      "vouch_for",
      {
        agent_address: tom_address,
      },
      "Alcie vouces for Tom"
    );
    await s.consistency();

    t.ok(alice_vouces_firstTime.Ok);

    var count_vouch_1 = await _call(
      alice,
      "vouch_count_for",
      { agent_address: tom_address },
      "Number of valid vouches for Tom"
    );

    await s.consistency();

    t.ok(count_vouch_1.Ok == "1");

    var alice_vouces_secondTime = await _call(
      alice,
      "vouch_for",
      {
        agent_address: tom_address,
      },
      "Alcie vouces for Tom"
    );
    await s.consistency();

    t.ok(alice_vouces_secondTime.Ok);

    var count_vouch_2 = await _call(
      alice,
      "vouch_count_for",
      { agent_address: tom_address },
      "Number of valid vouches for Tom"
    );

    await s.consistency();

    t.ok(count_vouch_2.Ok == "1");

    // Bob Can Vouch Once fro Tom ************************************************
    var Bob_vouces_firstTime = await _call(
      bob,
      "vouch_for",
      {
        agent_address: tom_address,
      },
      "Bob vouces for Tom"
    );
    await s.consistency();

    t.ok(Bob_vouces_firstTime.Ok);

    var count_vouch_3 = await _call(
      bob,
      "vouch_count_for",
      { agent_address: tom_address },
      "Number of valid vouches for Tom (3)"
    );

    await s.consistency();

    t.ok(count_vouch_3.Ok == "2");

    var bob_vouces_secondTime = await _call(
      bob,
      "vouch_for",
      {
        agent_address: tom_address,
      },
      "Bob vouces for Tom Second Time"
    );
    await s.consistency();

    t.ok(bob_vouces_secondTime.Ok);

    var count_vouch_4 = await _call(
      bob,
      "vouch_count_for",
      { agent_address: tom_address },
      "Number of valid vouches for Tom (4)"
    );

    await s.consistency();

    t.ok(count_vouch_4.Ok == "2");
  }
);

const stats = orchestrator.run();
