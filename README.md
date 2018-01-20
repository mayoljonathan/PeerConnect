# PeerConnect
Basic example for PeerJS (http://peerjs.com)

Demo : https://mayoljonathan.github.io/PeerConnect/

Note: When page was loaded, error may occur. "Load unsafe scripts" because the peerjs was served in HTTP.

# Known Bugs:
  - Old connections functions(disconnect,send) are not working. Only the latest connection works.
    - For example UserA connects to UserB and UserC. Both UserA -> UserB and UserA -> UserC are connected. UserA -> UserB disconnect function and send function are not working while UserA -> UserC are working.
