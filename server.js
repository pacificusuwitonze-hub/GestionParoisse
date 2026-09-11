const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// 1. CONNEXION A MONGODB
const MONGO_URI = "mongodb+srv://adminparoisse:Yd734mZzkXGIzWF3@cluster0.Yd734mZzkXGIzWF3.mongodb.net/paroisse?retryWrites=true&w=majority";

console.log("Tentative de connexion à MongoDB...");

mongoose.connect(MONGO_URI)
.then(() => console.log("✅ Connecté à MongoDB"))
.catch(err => console.log("❌ Erreur MongoDB:", err));

// 2. CREER LE MODELE PRODUIT
const produitSchema = new mongoose.Schema({
    nom: String,
    emoji: String,
    prix: Number
});
const Produit = mongoose.model('Produit', produitSchema);

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    // 1. Servir la page HTML
    if (req.url === '/' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(content);
        });
    } 
    // 2. L'API GET : Envoyer la liste depuis MongoDB
    else if (req.url === '/produits' && req.method === 'GET') {
        const produits = await Produit.find();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(produits));
    } 
    // 3. L'API POST : Ajouter dans MongoDB
    else if (req.url === '/produits' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const nouveau = JSON.parse(body);
            await Produit.create(nouveau);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Succès' }));
        });
    } 
    // 4. L'API DELETE
    else if (req.url.startsWith('/produits/') && req.method === 'DELETE') {
        const idASupprimer = req.url.split('/')[2];
        await Produit.findByIdAndDelete(idASupprimer);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Supprimé' }));
    } 
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Introuvable');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
