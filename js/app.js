import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* TROCA DE TELA */
function mostrar(id){
    ["login","dashboard","cadastro","sorteio"].forEach(t=>{
        document.getElementById(t).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
}

/* LOGIN INTELIGENTE */
window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth,email.value,senha.value);
    }catch(err){

        if(err.code === "auth/user-not-found"){
            await createUserWithEmailAndPassword(auth,email.value,senha.value);
        }else{
            alert("Erro: " + err.message);
        }
    }
};

window.logout = ()=> signOut(auth);

onAuthStateChanged(auth,(u)=>{
    if(u){
        mostrar("dashboard");
        carregar();
    } else {
        mostrar("login");
    }
});

/* PARTICIPANTES */
window.gerarParticipantes = ()=>{
    participantes.innerHTML="";
    for(let i=0;i<qtd.value;i++){
        participantes.innerHTML+=`<input class="p">`;
    }
};

/* SALVAR */
window.salvarConsorcio = async ()=>{
    let nomes=[...document.querySelectorAll(".p")].map(e=>e.value);

    await addDoc(collection(db,"consorcios"),{
        nome:nome.value,
        pessoas:nomes,
        uid:auth.currentUser.uid
    });

    alert("Salvo!");
    mostrar("dashboard");
    carregar();
};

/* LISTAR */
async function carregar(){
    let q=query(collection(db,"consorcios"),
        where("uid","==",auth.currentUser.uid));

    let snap=await getDocs(q);

    listaConsorcios.innerHTML="";

    snap.forEach(doc=>{
        let d=doc.data();

        listaConsorcios.innerHTML+=`
            <div class="item">
                ${d.nome}
                <button onclick="abrir()">Abrir</button>
            </div>
        `;
    });
}

/* SORTEIO */
window.abrir = ()=> mostrar("sorteio");

window.sortear = ()=>{
    nomeSorteado.innerText="SORTEADO!";
    mesSorteado.innerText="Contemplado 🎉";
};

/* NAV */
window.abrirCadastro=()=>mostrar("cadastro");
window.voltar=()=>mostrar("dashboard");

/* SERVICE WORKER */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}
