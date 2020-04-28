use hdk::prelude::*;

pub fn get_initial_members() -> ZomeApiResult<Vec<Address>> {
    let initial_members_json = hdk::property("initial_members")?;
    let initial_members: Result<Vec<Address>, _> =
        serde_json::from_str(&initial_members_json.to_string());

    match initial_members {
        Ok(initial_members_addresses) => Ok(initial_members_addresses),
        Err(_) => Err(ZomeApiError::from(String::from(
            "Could not get the initial valid members for this app",
        ))),
    }
}

pub fn get_necessary_vouches() -> ZomeApiResult<usize> {
    let necessary_vouches_json = hdk::property("necessary_vouches")?;
    let necessary_vouches: Result<usize, _> =
        serde_json::from_str(&necessary_vouches_json.to_string());

    match necessary_vouches {
        Ok(vouches) => Ok(vouches),
        Err(_) => Err(ZomeApiError::from(String::from(
            "Could not get the necessary vouches",
        ))),
    }
}

pub fn is_valid_member(agent_address: &Address) -> ZomeApiResult<bool> {
    let initial_members = get_initial_members()?;
    if initial_members.contains(agent_address) {
        return Ok(true);
    }

    let links = hdk::get_links(
        &agent_address,
        LinkMatch::Exactly("agent->vouch"),
        LinkMatch::Any,
    )?;

    let necessary_vouches = get_necessary_vouches()?;

    Ok(links.addresses().len() >= necessary_vouches)
}
