const http = require('http');
const fs = require('fs');
const path = require('path');

// Notre base de données temporaire en mémoire
let produits = [
    { _id: '1', nom: 'Croissant', emoji: '🥐', prix: 1500 },
    { _id: '2', nom: 'Pain', emoji: '🍞', prix: 1000 }
];

const server = http.createServer((req, res) => {
    // 1. Servir la page HTML principale
    if (req.url === '/' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(content);
        });
    } 
    // 2. L'API GET : Envoyer la liste des produits à la page web
    else if (req.url === '/produits' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(produits));
    } 
    // 3. L'API POST : Recevoir un nouveau produit et l'ajouter
    else if (req.url === '/produits' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const nouveau = JSON.parse(body);
            nouveau._id = Date.now().toString(); // Génère un identifiant unique
            produits.push(nouveau);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Succès' }));
        });
    } 
    // 4. L'API DELETE : Supprimer un produit de la liste
    else if (req.url.startsWith('/produits/') && req.method === 'DELETE') {
        const idASupprimer = req.url.split('/')[2];
        produits = produits.filter(p => p._id !== idASupprimer);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Supprimé' }));
    } 
    // Si la route n'existe pas
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Introuvable');
    }
});

// Le serveur écoute sur le port 3000
server.listen(3000, () => {
    console.log('🚀 Serveur démarré sur http://localhost:3000');
});
