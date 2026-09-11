const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto'); // pour hasher les mots de passe

const MONGO_URI = "mongodb+srv://adminparoisse:Yd734mZzkXGIzWF3@cluster0.4toblpw.mongodb.net/paroisse?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
.then(() => console.log("✅ Connecté à MongoDB"))
.catch(err => console.log("❌ Erreur MongoDB:", err));

// MODELES
const produitSchema = new mongoose.Schema({ nom: String, emoji: String, prix: Number });
const Produit = mongoose.model('Produit', produitSchema);

const responsableSchema = new mongoose.Schema({ 
    nom: String, 
    email: {type: String, unique: true}, 
    password: String, // on va le hasher
    role: {type: String, default: 'admin'}
});
const Responsable = mongoose.model('Responsable', responsableSchema);

const membreSchema = new mongoose.Schema({ 
    nom: String, 
    telephone: String, 
    adresse: String,
    dateAjout: {type: Date, default: Date.now}
});
const Membre = mongoose.model('Membre', membreSchema);

const offrandeSchema = new mongoose.Schema({ 
    type: String, // Quete, Dime, Action de grace
    montant: Number, 
    date: {type: Date, default: Date.now},
    responsable: String // qui a enregistré
});
const Offrande = mongoose.model('Offrande', offrandeSchema);

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    // SERVIR HTML
    if (req.url === '/' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(content);
        });
    }
    
    // API PRODUITS
    else if (req.url === '/produits' && req.method === 'GET') {
        const produits = await Produit.find();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(produits));
    }
    else if (req.url === '/produits' && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            await Produit.create(JSON.parse(body));
            res.writeHead(201).end(JSON.stringify({ message: 'Succès' }));
        });
    }

    // API MEMBRES
    else if (req.url === '/membres' && req.method === 'GET') {
        const membres = await Membre.find().sort({dateAjout: -1});
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(membres));
    }
    else if (req.url === '/membres' && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            await Membre.create(JSON.parse(body));
            res.writeHead(201).end(JSON.stringify({ message: 'Membre ajouté' }));
        });
    }

    // API OFFRANDES
    else if (req.url === '/offrandes' && req.method === 'GET') {
        const offrandes = await Offrande.find().sort({date: -1});
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(offrandes));
    }
    else if (req.url === '/offrandes' && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            await Offrande.create(JSON.parse(body));
            res.writeHead(201).end(JSON.stringify({ message: 'Offrande enregistrée' }));
        });
    }

    // API LOGIN
    else if (req.url === '/login' && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const {email, password} = JSON.parse(body);
            const hash = crypto.createHash('sha256').update(password).digest('hex');
            const user = await Responsable.findOne({email, password: hash});
            if(user) res.writeHead(200).end(JSON.stringify({message: 'Connecté', nom: user.nom}));
            else res.writeHead(401).end(JSON.stringify({message: 'Email ou mot de passe incorrect'}));
        });
    }

    else { res.writeHead(404).end('Introuvable'); }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
