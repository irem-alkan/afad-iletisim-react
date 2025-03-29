const express = require("express");
const http = require("http");
const { Server } = require("socket.io"); 
const cors = require("cors");

const app = express();
app.use(cors()); 

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});


app.get("/", (req, res) => {
    res.send("📡 AFAD Sunucusu çalışıyor!");
});


io.on("connection", (socket) => {
    console.log(`✅ Bağlandı: ${socket.id}`);

    
    socket.on("oda_katil", (odaAdi) => {
        socket.join(odaAdi);
        console.log(`🚪 ${socket.id}, '${odaAdi}' odasına katıldı`);
        io.to(odaAdi).emit("sistem_mesaji", `🔔 ${socket.id} odaya katıldı`);
    });

    
    socket.on("mesaj_gonder", (data) => {
        console.log(`💬 Mesaj | Oda: ${data.oda} | ${data.kullanici}: ${data.mesaj}`);
        if (data.oda) {
            io.to(data.oda).emit("mesaj_al", data);
        } else {
            io.emit("mesaj_al", data);
        }
    });

    
    socket.on("konum_gonder", (konum) => {
        console.log(`📍 Konum | Oda: ${konum.oda} | Enlem: ${konum.enlem}, Boylam: ${konum.boylam}`);
        if (konum.oda) {
            io.to(konum.oda).emit("konum_al", konum);
        } else {
            io.emit("konum_al", konum);
        }
    });

    
    socket.on("disconnect", () => {
        console.log(`❌ Ayrıldı: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 AFAD Sunucusu ${PORT} portunda çalışıyor...`);
});
