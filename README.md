# WebRTC
# Communication en temps réel avec WebRTC :
WebRTC est un projet open source destiné à permettre la communication en temps réel de données audio, vidéo et de données dans des applications Web et natives.




# WebRTC dispose de plusieurs API JavaScript :
getUserMedia (): capturer de l'audio et de la vidéo.
MediaRecorder: enregistrer de l'audio et de la vidéo.
RTCPeerConnection: flux audio et vidéo entre utilisateurs.
RTCDataChannel: flux de données entre utilisateurs.



# Où puis-je utiliser WebRTC?
Dans Firefox, Opera et Chrome sur le bureau et Android. WebRTC est également disponible pour les applications natives sur iOS et Android.
donc pour tester on à utilisé un serveur en ligne ce lui de https://lightsail.aws.amazon.com
donc on ecoute ce port http://52.47.102.211:8080/



# Qu'est-ce que la signalisation?
WebRTC utilise RTCPeerConnection pour communiquer des données en streaming entre navigateurs, mais nécessite également un mécanisme de coordination de la communication et d'envoi de messages de contrôle, un processus appelé signalisation. Les méthodes et protocoles de signalisation ne sont pas spécifiés par WebRTC, donc on a utilisé un serveur node-js dans le quelle on a utilisé diverses API java script :
websocket, http, url, fs et path.



# Que sont STUN et TURN?
WebRTC est conçu pour fonctionner d'égal à égal, afin que les utilisateurs puissent se connecter par la voie la plus directe possible. Cependant, WebRTC est conçu pour faire face à la mise en réseau dans le monde réel: les applications client doivent traverser des passerelles et des pare-feu NAT, et la mise en réseau entre homologues nécessite des replis en cas d'échec de la connexion directe. Dans le cadre de ce processus, les API WebRTC utilisent des serveurs STUN pour obtenir l'adresse IP de votre ordinateur et des serveurs TURN pour fonctionner en tant que serveurs de relais en cas d'échec de la communication entre homologues. 



Pour la sécuriter on a pas pu la faire :

