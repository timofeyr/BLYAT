// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CertStorage {
    struct Cert {
        string cid;
        address owner;
    }

    mapping(address => Cert[]) public certs;

    function uploadCert(string memory cid) public {
        certs[msg.sender].push(Cert(cid, msg.sender));
    }

    function getCerts() public view returns (string[] memory) {
        Cert[] storage userCerts = certs[msg.sender];
        string[] memory result = new string[](userCerts.length);
        for (uint i = 0; i < userCerts.length; i++) {
            result[i] = userCerts[i].cid;
        }
        return result;
    }
}
