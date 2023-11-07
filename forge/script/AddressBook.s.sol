// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import { AddressBook } from "src/AddressBook.sol";

contract AddressBookScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        new AddressBook();
        vm.stopBroadcast();
    }
}
