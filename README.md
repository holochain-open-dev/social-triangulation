# Social Triangulation Zome

TLDR: **"this hApp can only be joined by friends of friends"**.

This social triangulation zome is a basic membrane to be reused in holochain applications. It may be useful in contexts where the application is tuned for a small number of participants that loosely know each other, or have to live nearby, etc.

## Membrane workflow

1. The hApp includes this zome and sets two properties in the DNA:
* `initial_members`: initial list of friends that are allowed in the hApp.
* `necessary_vouches`: number of friends that have to "vouch" for you to be allowed in the hApp. This must be equal or less than the number of initial members.
2. The agents with address inside the `initial_members` join the hApp. They are automatically valid.
3. If an agent wants to enter the hApp, the agents that are already inside the app have to vouch for him, using their agent address. When the agent receives a number of vouches equal or more than the `necessary_vouches`, they can install the hApp and enter the network.
4. From now on, this new agent can also vouch for other agents to enter the hApp.

## Building

```bash
nix shell
hc package
```

## Tests

Until `@holochain/tryorama` supports passing in properties, tests have to be manual, since there is no way to automatically start vouching for anyone if the `initial_members` property can't be set.

## Usage

This is a membrane zome: it only defines how agents can enter the network. It does not define any domain logic in your application, but rather has to be used with other zomes that do.

Usage until there is a better zome distribution channel:

1. Copy and paste the zome code into your application.
2. Set the `initial_members` and `necessary_vouches` properties in the `app.json`.
3. Good to go!
