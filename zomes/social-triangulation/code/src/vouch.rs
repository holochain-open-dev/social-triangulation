use hdk::prelude::*;

pub fn entry_def() -> ValidatingEntryType {
    entry!(
        name: "vouch",
        description: "A vouch that an agent makes that some other agent should be able to join the network",
        sharing: Sharing::Public,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: |validation_data: hdk::EntryValidationData<Address>| {
            match validation_data {
                EntryValidationData::Create { .. } => {
                    Ok(())
                },
                _ => Err(String::from("Cannot update or delete a vouch")),
            }
        },
        links: [
            from!(
                "%agent_id",
                link_type: "agent->vouch",
                validation_package: || {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation: | validation_data: hdk::LinkValidationData | {
                    match validation_data {
                        // TODO: validate that the link's tag is the agent address of the signing person
                        hdk::LinkValidationData::LinkAdd { .. } => Ok(()),
                        _ => Err(String::from("Cannot delete links"))
                    }
                }
            )
        ]
    )
}

/** Helpers */

pub fn vouch_entry(agent_address: &Address) -> Entry {
    Entry::App("vouch".into(), agent_address.into())
}

/** Handlers */

pub fn vouch_for_agent(agent_address: &Address) -> ZomeApiResult<()> {
    let vouch = vouch_entry(&agent_address);

    let vouch_address = hdk::commit_entry(&vouch)?;

    hdk::link_entries(
        &agent_address,
        &vouch_address,
        "agent->vouch",
        &hdk::AGENT_ADDRESS.to_string(),
    )?;

    Ok(())
}
