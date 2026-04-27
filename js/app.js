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

/* SPLASH */
setTimeout(()=>{
    document.getElementById("splash").style.display="none";
},1500);

/* NAV */
function tela(id){
    document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"));
    document.getElementById(id).classList.add("ativa");
}

/* LOGIN */
window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth,email.value,senha.value);
    }catch{
        await createUserWithEmailAndPassword(auth,email.value,senha.value);
    }
};

window.logout = ()=> signOut(auth);

onAuthStateChanged(auth,(u)=>{
    if(u){
        tela("dashboard");
        carregarConsorcios();
    } else {
        tela("login");
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
        inicio:inicio.value,
        fim:fim.value,
        uid:auth.currentUser.uid
    });

    alert("Salvo!");
    tela("dashboard");
    carregarConsorcios();
};

/* LISTAR */
async function carregarConsorcios(){
    let q=query(collection(db,"consorcios"),
        where("uid","==",auth.currentUser.uid));

    let snap=await getDocs(q);

    listaConsorcios.innerHTML="";

    snap.forEach(doc=>{
        let d=doc.data();

        listaConsorcios.innerHTML+=`
            <div class="card-consorcio">
                <b>${d.nome}</b>

                <div class="tags">
                    ${d.pessoas.map(p=>`<span class="tag">${p}</span>`).join("")}
                </div>

                <button onclick="abrirSorteio()">Sortear</button>
            </div>
        `;
    });
}

/* SORTEIO */
let atual=null, usados=[], meses=[];

window.abrirSorteio = ()=>{
    tela("sorteio");
};

window.sortear = ()=>{
    let nomes=[...document.querySelectorAll(".tag")].map(t=>t.innerText);

    let sorteado=nomes[Math.floor(Math.random()*nomes.length)];

    nomeSorteado.innerText=sorteado;
    mesSorteado.innerText="Contemplado(a)";

    confetti();
};

/* SERVICE WORKER */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

/* NAV */
window.abrirCadastro=()=>tela("cadastro");
window.voltar=()=>tela("dashboard");
