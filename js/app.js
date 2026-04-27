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

/* MESES */
function gerarMeses(inicio,fim){
    let meses=[];
    let [a,m]=inicio.split("-");
    let [af,mf]=fim.split("-");
    let d=new Date(a,m-1,1);
    let f=new Date(af,mf-1,1);

    while(d<=f){
        meses.push(d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}));
        d.setMonth(d.getMonth()+1);
    }
    return meses;
}

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
            <div class="card">
                <b>${d.nome}</b>
                <button onclick="abrirSorteio('${doc.id}')">Sortear</button>
            </div>
        `;
    });
}

/* SORTEIO */
let atual=null, usados=[], meses=[];

window.abrirSorteio = async (id)=>{

    let snap=await getDocs(collection(db,"consorcios"));

    snap.forEach(doc=>{
        if(doc.id===id){
            atual=doc.data();
        }
    });

    meses=gerarMeses(atual.inicio,atual.fim);
    usados=[];

    titulo.innerText=atual.nome;

    tela("sorteio");
};

window.sortear = ()=>{
    let disp=atual.pessoas.filter(p=>!usados.includes(p));

    let sorteado=disp[Math.floor(Math.random()*disp.length)];

    let mes=meses[usados.length];

    usados.push(sorteado);

    nomeSorteado.innerText=sorteado;
    mesSorteado.innerText="Contemplado(a) em "+mes;

    confetti();
};

/* NAV */
window.abrirCadastro=()=>tela("cadastro");
window.voltar=()=>tela("dashboard");
