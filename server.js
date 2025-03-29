const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
});

app.get("/", (req, res) => {
    res.send("AFAD Sunucusu çalışıyor!");
});

io.on("connection", (socket) => {
    console.log(`✅ Yeni bağlantı: ${socket.id}`);

    socket.on("mesaj_gonder", (data) => {
        console.log("📨 Mesaj:", data);
        io.emit("mesaj_al", data);
    });

    socket.on("konum_gonder", (konum) => {
        console.log("📍 Konum:", konum);
        io.emit("konum_al", konum);
    });

    socket.on("disconnect", () => {
        console.log(`❌ Bağlantı koptu: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
});
