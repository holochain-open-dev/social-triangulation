#![feature(proc_macro_hygiene)]
extern crate hdk;
extern crate hdk_proc_macros;
extern crate holochain_entry_utils;
extern crate holochain_json_derive;
extern crate serde;
extern crate serde_derive;
extern crate serde_json;

use hdk::holochain_persistence_api::cas::content::Address;
use hdk::{entry_definition::ValidatingEntryType, error::ZomeApiResult};
use hdk_proc_macros::zome;

pub mod members;
pub mod setting;
pub mod vouch;

#[zome]
mod social_triangulation_zome {
    use crate::vouch::Vouch;
    use hdk::holochain_core_types::time::Timeout;
    use hdk::prelude::*;
    use hdk::AGENT_ADDRESS;
    use holochain_entry_utils::HolochainEntry;

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
                let agent_address = validation_data.package.chain_header.provenances()[0].source();
                hdk::debug(format!(
                    "hedayat: agent address in validation_data {:?}",
                    agent_address.clone()
                ))?;

                match members::is_valid_member(&agent_address)? {
                    true => Ok(()),
                    false => Err(format!("Validation Error: Agent {} is not valid since it does not comply with social triangulation conditions", agent_address))
                }
            }
            _ => Err(String::from("Validation Error:  validating the agent")),
        }
    }

    #[entry_def]
    fn vouch_entry_def() -> ValidatingEntryType {
        vouch::entry_def()
    }

    #[zome_fn("hc_public")]
    fn my_address() -> ZomeApiResult<Address> {
        Ok(AGENT_ADDRESS.to_string().into())
    }

    #[zome_fn("hc_public")]
    fn vouch_for(agent_address: String) -> ZomeApiResult<Address> {
        vouch::vouch_for_agent(agent_address.into())
    }

    #[zome_fn("hc_public")]
    fn get_setting() -> ZomeApiResult<String> {
        setting::get_all_settings()
    }

    #[zome_fn("hc_public")]
    pub fn get_entry(entry_address: Address) -> ZomeApiResult<String> {
        let option = GetEntryOptions::new(StatusRequestKind::All, true, true, Timeout::default());
        let entry_result = hdk::get_entry_result(&entry_address, option)?;
        Ok(JsonString::from(entry_result).to_string())
    }

    #[zome_fn("hc_public")]
    pub fn get_agent_vouch(agent_address: Address) -> ZomeApiResult<Option<Entry>> {
        let vouch_entry = Vouch::new(agent_address).address()?;
        let address = hdk::get_entry(&vouch_entry)?;
        Ok(address)
    }

    #[zome_fn("hc_public")]
    fn vouch_count_for(agent_address: Address) -> ZomeApiResult<String> {
        Ok(format!("{}", vouch::vouch_count_for_agent(agent_address)?))
    }
}
