use crate::setting;
use crate::vouch;
use hdk::prelude::*;

pub fn is_valid_member(agent_address: &Address) -> ZomeApiResult<bool> {
    if agent_is_admin(agent_address)? == true {
        return Ok(true);
    }

    let result = vouch::vouch_count_for_agent(agent_address.clone());
    let min_req_vouches = setting::get_minimum_required_vouches()?;
    if let Ok(no_vouch) = result {
        if no_vouch >= min_req_vouches {
            return Ok(true);
        }
    }
    Ok(false)
}

pub fn agent_is_admin(agent_address: &Address) -> Result<bool, String> {
    let initial_members = setting::get_admin_members()?;
    if initial_members.contains(agent_address) {
        Ok(true)
    } else {
        Ok(false)
    }
}
