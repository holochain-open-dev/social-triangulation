// use crate::members;
use hdk::prelude::*;
pub fn get_admin_members() -> ZomeApiResult<Vec<Address>> {
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

pub fn get_minimum_required_vouches() -> ZomeApiResult<u8> {
    let necessary_vouches_json = hdk::property("necessary_vouches")?;
    let necessary_vouches: Result<u8, _> =
        serde_json::from_str(&necessary_vouches_json.to_string());

    match necessary_vouches {
        Ok(vouches) => Ok(vouches),
        Err(_) => Err(ZomeApiError::from(String::from(
            "Could not get the necessary vouches",
        ))),
    }
}

pub fn get_all_settings() -> ZomeApiResult<String> {
    let necessary_vouches_json = hdk::property("necessary_vouches")?;
    let initial_members_json = hdk::property("initial_members")?;
    return Ok(format!(
        "Admin_Members:{}  Minimum_Required_Vouch:{}",
        initial_members_json.to_string(),
        necessary_vouches_json.to_string()
    ));
}
