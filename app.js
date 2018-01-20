// Normalize the various vendor prefixed versions of getUserMedia.
navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || 
    navigator.msGetUserMedia);

// https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
let isMobile = typeof window.orientation !== 'undefined' ? true : false;

var peer = new Peer({key: 'pxozm43r369ftj4i'});

// Just to have an object containing connectedPeers so that when you connect to a peer that is already connected, you can make an error
var connectedPeers = {};

var peerApp = {
    init: ()=>{
        // SHOW YOUR OWN PEER ID
        peer.on('open', (id)=> {
            document.getElementById('my_id').innerHTML = id;
        });
        // WHEN YOU RECEIVES A CONNECTION FROM OTHER PEER
        peer.on('connection', peerApp.connect);

        // WHEN YOU RECEIVES A CALL
        peer.on('call', (call)=>{
            if(!isMobile){
                navigator.getUserMedia({audio: true, video: true}, (stream)=>{
                    let call = peer.call(conn.peer, stream);
                    call.answer(stream); 
                    // Wait for stream on the call, then set peer video display
                    call.on('stream', (peerStream)=>{
                        document.getElementById('their-video').setAttribute('src', URL.createObjectURL(peerStream));
                    });
                    // Set your video displays
                    document.getElementById('my-video').setAttribute('src', URL.createObjectURL(stream));
                }, (err)=>{ 
                    alert(err);
                });
    
            }else{
                alert('Receive on smartphone');
                // FOR CHROME ANDROID
                // user means front cam
                // environment means back camera
                navigator.mediaDevices.getUserMedia({video: {facingMode: {exact: 'user'}}})
                    .then(stream=>{
                        let call = peer.call(conn.peer, stream);
                    
                        // Wait for stream on the call, then set peer video display
                        call.on('stream', (peerStream)=>{
                            document.getElementById('their-video').setAttribute('src', URL.createObjectURL(peerStream));
                        });
                        // Set your video displays
                        document.getElementById('my-video').setAttribute('src', URL.createObjectURL(stream));
                    }).catch(err=>{
                        alert(err);
                    });
            }
    
        });

        // WHEN SOMETHING ERROR HAPPENS
        peer.on('error', (err)=>{
            alert(err);
        });
    },
    connect: (conn)=>{
        // BUILD THE CHATBOX UI
        peerApp.buildChatBox(conn);

        // Fix the connection receiver to successfully send a message to the connection requester
        conn.open = true;

        // TRIGGERS WHEN YOU RECEIVE A MESSAGE FROM OTHER PEER
        conn.on('data', (data)=>{
            document.getElementById(`message-box-${conn.peer}`).innerHTML += `<span><strong>Peer said: </strong>${data}</span><br>`;
        });
        
        // TRIGGERS WHEN PEER HAS DISCONNECTED
        conn.on('close', ()=>{
            alert(`${conn.peer} has disconnected`);
            peerApp.destroyChatBox(conn.peer);
        });
    },
    sendConnectionRequest: ()=>{
        const peer_id = document.getElementById('peer_id').value;
        if(!connectedPeers[peer_id]){
            // START CONNECTION TO THE OTHER PEER
            let conn = peer.connect(peer_id);

            // TRIGGERS WHEN CONNECTION IS SUCCESSFUL
            conn.on('open', ()=>{
                peerApp.connect(conn);
                document.getElementById('peer_id').value = '';
            });
        }else{
            alert(`You already have a connection with ${peer_id}`);
        }
    },
    buildChatBox: (conn)=>{
        connectedPeers[conn.peer] = true;

        let chatbox = `
        <div class="chatbox" id="chatbox-${conn.peer}">
            <div class="chatbox-header">
                <span>Chatting with ${conn.peer}</span>
                <button id='call-button-${conn.peer}'>C</button>
                <button class="push-right" id='disconnect-button-${conn.peer}'>X</button>
            </div>
            <div class="chatbox-body">
                <div class="message-box" id="message-box-${conn.peer}">
                    <span style="color: green"><i>Connection successful</i></span><br>
                </div>
            </div>
            <div class="chatbox-footer">
                <input type="text" class="message-input" id="message-input-${conn.peer}">
                <button class="push-right" id="send-button-${conn.peer}">Send</button>
            </div>
        </div>
        `;

        // Add a delay so no error occured
        setTimeout(()=>{
            // Bind an onclick to the send button so that you can pass the conn object to the sendMessage function
            document.getElementById(`send-button-${conn.peer}`).onclick = ()=>{
                peerApp.sendMessage(conn);
            }
            // Bind an onclick to the disconnect button so that you can pass the conn object to the disconnect function
            document.getElementById(`disconnect-button-${conn.peer}`).onclick = ()=>{
                peerApp.disconnect(conn);
            }
            // Bind an onclick to the call button so that you can pass the conn object to the call function
            document.getElementById(`call-button-${conn.peer}`).onclick = ()=>{
                peerApp.call(conn);
            }
            // Bind an onkeydown to the send button so that you can pass the conn object to the sendMessage function
            document.getElementById(`message-input-${conn.peer}`).onkeydown = ()=>{
                handleKeyPress(event,'send', conn);
            }
        });

        // Append Chatbox to Connections 
        document.getElementById('connections').innerHTML += chatbox;
    },
    call: (conn)=>{
        // Initiate a call!
        if(!isMobile){
            navigator.getUserMedia({audio: true, video: true}, (stream)=>{
                let call = peer.call(conn.peer, stream);
                
                // Wait for stream on the call, then set peer video display
                call.on('stream', (peerStream)=>{
                    document.getElementById('their-video').setAttribute('src', URL.createObjectURL(peerStream));
                });
                // Set your video displays
                document.getElementById('my-video').setAttribute('src', URL.createObjectURL(stream));
            }, (err)=>{ 
                alert(err);
            });

        }else{
            alert('Calling from smartphone');
            // FOR CHROME ANDROID
            // user means front cam
            // environment means back camera
            navigator.mediaDevices.getUserMedia({video: {facingMode: {exact: 'user'}}})
                .then(stream=>{
                    let call = peer.call(conn.peer, stream);
                
                    // Wait for stream on the call, then set peer video display
                    call.on('stream', (peerStream)=>{
                        document.getElementById('their-video').setAttribute('src', URL.createObjectURL(peerStream));
                    });
                    // Set your video displays
                    document.getElementById('my-video').setAttribute('src', URL.createObjectURL(stream));
                }).catch(err=>{
                    alert(err);
                });
        }

    },
    sendMessage: (conn)=>{
        let message  = document.getElementById(`message-input-${conn.peer}`).value;
        if(message && message.trim().length != 0){
            conn.send(message);
            document.getElementById(`message-input-${conn.peer}`).value = '';
            document.getElementById(`message-box-${conn.peer}`).innerHTML += `<span><strong>You said: </strong>${message}</span><br>`;
        }
    },
    destroyChatBox: (peer_id)=>{
        document.getElementById(`chatbox-${peer_id}`).remove();
        delete connectedPeers[peer_id];
    },
    disconnect: (conn)=>{  
        conn.close(conn.peer);
        peerApp.destroyChatBox(conn.peer);
    }
}

// HANDLE ENTER KEY PRESSED
var handleKeyPress = (e,action,args)=>{
    if(e.keyCode === 13){
        if(action === 'connect'){ 
            peerApp.sendConnectionRequest();
        }else if(action === 'send'){
            peerApp.sendMessage(args);
        }
    }
}

// STARTING POINT
peerApp.init();

// TRIGGERS WHEN THE TAB WAS CLOSED/REFRESHED
window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};
