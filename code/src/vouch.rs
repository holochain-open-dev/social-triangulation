use hdk::holochain_core_types::time::Timeout;
use hdk::prelude::*;
use std::collections::HashMap;
#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct Vouch {
    pub agent_address: Address,
}

impl Vouch {
    pub fn new(agent_address: Address) -> Self {
        Self { agent_address }
    }
    pub fn entry_type() -> String {
        String::from("vouch")
    }
}

pub fn entry_def() -> ValidatingEntryType {
    entry!(
        name: Vouch::entry_type(),
        description: "A vouch that an agent makes that some other agent should be able to join the network",
        sharing: Sharing::Public,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: |validation_data: hdk::EntryValidationData<Vouch>| {
            match validation_data {
                EntryValidationData::Create {  entry, validation_data } => { // Any agent inside the DNA can vouch for others
                let agent_address = validation_data.package.chain_header.provenances()[0].source();
                    if &entry.agent_address == &agent_address {
                        return Err(String::from("Agent can not vouch for himself"));
                    }
                    Ok(())
                },
                _ => Err(String::from("Cannot update or delete a vouch")), // Vouches can not be modify or deleted
            }
        }
    )
}

// One agent can vouch for another one
pub fn vouch_for_agent(agent_address: Address) -> ZomeApiResult<Address> {
    let vouch_entry = Vouch::new(agent_address).entry();
    let address = hdk::commit_entry(&vouch_entry)?;
    Ok(address)
}

// How many vouch each agent received?
pub fn vouch_count_for_agent(agent_address: Address) -> ZomeApiResult<u8> {
    let vouch_entry = Vouch::new(agent_address).entry();
    let vouch_address = vouch_entry.address();
    if let Ok(None) = hdk::get_entry(&vouch_address) {
        Ok(0)
    } else {
        let option =
            GetEntryOptions::new(StatusRequestKind::Latest, true, true, Timeout::default());
        let entry_result = hdk::get_entry_result(&vouch_address, option)?;

        if let GetEntryResultType::Single(item) = entry_result.result {
            // we query for the unique headers. To prevent double vouching by one agent.
            let unique: HashMap<_, _> = item
                .headers
                .iter()
                .map(|c| (c.provenances()[0].source(), c.entry_type()))
                .collect();
            let leng = unique.len() as u8;
            return Ok(leng);
        } else {
            Err(ZomeApiError::from(String::from(
                "No vouch is registered for this agent",
            )))
        }
    }
}
