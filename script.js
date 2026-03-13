// Configuración de Firebase - ESRN 135
const firebaseConfig = {
  apiKey: "AIzaSyAjATR-ArZxVgcBvCrv5guFZ5-V9aX4avc",
  authDomain: "gestion-esrn135.firebaseapp.com",
  projectId: "gestion-esrn135",
  storageBucket: "gestion-esrn135.firebasestorage.app",
  messagingSenderId: "500789019734",
  appId: "1:500789019734:web:fee9ac696b04e971dde7f7",
  measurementId: "G-WRSV3MV613"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- LÓGICA DE LA APP ---

// Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
        })
        .catch(err => alert("Error: Acceso denegado"));
});

// Registro de copias y deudas
document.getElementById('copy-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = {
        nombre: document.getElementById('user-name').value.toLowerCase().trim(),
        curso: document.getElementById('user-course').value,
        monto: parseFloat(document.getElementById('custom-amount').value),
        metodo: document.getElementById('pay-method').value,
        fecha: new Date().toLocaleDateString('es-AR'),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("movimientos").add(datos);
        alert("✅ Registrado con éxito");
        document.getElementById('copy-form').reset();
    } catch (error) {
        alert("Error al guardar: " + error.message);
    }
});

// Buscador de deuda acumulada
document.getElementById('search-input').addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase().trim();
    const statusBox = document.getElementById('user-status');
    
    if (query.length < 3) { statusBox.innerHTML = ""; return; }

    const snapshot = await db.collection("movimientos").where("nombre", "==", query).get();
    let deudaTotal = 0;

    snapshot.forEach(doc => {
        if (doc.data().metodo === "Debe") deudaTotal += doc.data().monto;
        if (doc.data().metodo === "Pagado" && doc.data().monto < 0) deudaTotal += doc.data().monto; 
    });

    statusBox.innerHTML = snapshot.empty ? "No hay registros" : 
        `<strong>${query.toUpperCase()}</strong> - Deuda: <span style="color:red">$${deudaTotal}</span>`;
});

function setAmount(val) { document.getElementById('custom-amount').value = val; }