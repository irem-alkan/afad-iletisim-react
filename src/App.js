import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// IP adresini kendi cihazına göre değiştir
const socket = io("http://192.168.1.72:3000");

function App() {
    const [kullanici, setKullanici] = useState("AFAD Kullanıcı");
    const [oda, setOda] = useState("mahalle-1"); // Varsayılan oda
    const [mesaj, setMesaj] = useState("");
    const [mesajlar, setMesajlar] = useState([]);

    useEffect(() => {
        // Odaya katıl
        socket.emit("oda_katil", oda);

        // Mesajları dinle
        socket.on("mesaj_al", (data) => {
            setMesajlar((prev) => [...prev, `${data.kullanici}: ${data.mesaj}`]);
        });

        // Konum geldiğinde göster
        socket.on("konum_al", (konum) => {
            alert(`📍 Konum alındı: Enlem ${konum.enlem}, Boylam ${konum.boylam}`);
        });

        // Sistem mesajı (örnek: odaya giriş)
        socket.on("sistem_mesaji", (msg) => {
            setMesajlar((prev) => [...prev, `🔔 ${msg}`]);
        });

        return () => {
            socket.off("mesaj_al");
            socket.off("konum_al");
            socket.off("sistem_mesaji");
        };
    }, [oda]);

    const mesajGonder = () => {
        if (!mesaj.trim()) return;
        socket.emit("mesaj_gonder", { kullanici, mesaj, oda });
        setMesaj("");
    };

    const konumGonder = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const konum = {
                    oda,
                    enlem: pos.coords.latitude,
                    boylam: pos.coords.longitude,
                };
                socket.emit("konum_gonder", konum);
                alert(`✅ Konum gönderildi: ${konum.enlem}, ${konum.boylam}`);
            });
        } else {
            alert("Tarayıcınız konum servisini desteklemiyor.");
        }
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "Arial" }}>
            <h1>📡 AFAD İletişim Sistemi</h1>

            <div>
                <input
                    placeholder="Kullanıcı Adı"
                    value={kullanici}
                    onChange={(e) => setKullanici(e.target.value)}
                    style={{ padding: "8px", marginRight: "10px" }}
                />
                <input
                    placeholder="Oda Adı"
                    value={oda}
                    onChange={(e) => setOda(e.target.value)}
                    style={{ padding: "8px" }}
                />
            </div>

            <div style={{ marginTop: "15px" }}>
                <input
                    type="text"
                    value={mesaj}
                    placeholder="Mesajınızı yazın..."
                    onChange={(e) => setMesaj(e.target.value)}
                    style={{ padding: "10px", width: "300px" }}
                />
                <button onClick={mesajGonder} style={{ margin: "0 10px" }}>Gönder</button>
                <button onClick={konumGonder}>Konum Gönder</button>
            </div>

            <h3>📨 Gelen Mesajlar:</h3>
            <ul>
                {mesajlar.map((m, i) => (
                    <li key={i}>{m}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
