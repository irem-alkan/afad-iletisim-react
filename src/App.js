import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Sunucunun çalıştığı IP ve port (senin IP'n)
const socket = io("http://192.168.1.72:3000");

function App() {
    const [kullanici, setKullanici] = useState("AFAD Kullanıcı");
    const [oda, setOda] = useState("mahalle-1");
    const [mesaj, setMesaj] = useState("");
    const [mesajlar, setMesajlar] = useState([]);
    const [katildi, setKatildi] = useState(false); // Odaya katılım durumu

    useEffect(() => {
        if (!katildi) return;

        // Odaya katıl
        socket.emit("oda_katil", oda);

        // Mesaj alma
        socket.on("mesaj_al", (data) => {
            setMesajlar((prev) => [...prev, `${data.kullanici}: ${data.mesaj}`]);
        });

        // Konum alma
        socket.on("konum_al", (konum) => {
            alert(`📍 Konum alındı: Enlem ${konum.enlem}, Boylam ${konum.boylam}`);
        });

        // Sistem mesajı
        socket.on("sistem_mesaji", (msg) => {
            setMesajlar((prev) => [...prev, `🔔 ${msg}`]);
        });

        return () => {
            socket.off("mesaj_al");
            socket.off("konum_al");
            socket.off("sistem_mesaji");
        };
    }, [katildi, oda]);

    const odayaKatil = () => {
        if (!oda.trim()) {
            alert("Lütfen bir oda adı girin.");
            return;
        }
        socket.emit("oda_katil", oda);
        setKatildi(true);
    };

    const mesajGonder = () => {
        if (!katildi) {
            alert("Lütfen önce odaya katılın.");
            return;
        }
        if (!mesaj.trim()) return;
        socket.emit("mesaj_gonder", { kullanici, mesaj, oda });
        setMesaj("");
    };

    const konumGonder = () => {
        if (!katildi) {
            alert("Lütfen önce odaya katılın.");
            return;
        }
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
                    style={{ padding: "8px", marginRight: "10px" }}
                />
                <button onClick={odayaKatil}>Odaya Katıl</button>
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
