#![feature(proc_macro_hygiene)]
extern crate hdk;
extern crate hdk_proc_macros;
extern crate serde;
extern crate serde_derive;
extern crate serde_json;

use hdk::holochain_persistence_api::cas::content::Address;
use hdk::prelude::*;
use hdk::{entry_definition::ValidatingEntryType, error::ZomeApiResult};
use hdk_proc_macros::zome;

// see https://developer.holochain.org/api/0.0.40-alpha1/hdk/ for info on using the hdk library

pub mod members;
pub mod vouch;

#[zome]
mod social_triangulation_zome {

    #[init]
    fn init() {
        Ok(())
    }

    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        match validation_data {
            EntryValidationData::Create {
                validation_data, ..
            } => {
                let agent_address = validation_data.package.chain_header.entry_address();
                match members::is_valid_member(&agent_address)? {
                    true => Ok(()),
                    false => Err(format!("Agent {} is not valid since it does not comply with social triangulation conditions", agent_address))
                }
            }
            _ => Err(String::from("Error validating the agent")),
        }
    }

    #[entry_def]
    fn vouch_entry_def() -> ValidatingEntryType {
        vouch::entry_def()
    }

    #[zome_fn("hc_public")]
    fn vouch_for_agent(agent_address: Address) -> ZomeApiResult<()> {
        vouch::vouch_for_agent(&agent_address)
    }
}
