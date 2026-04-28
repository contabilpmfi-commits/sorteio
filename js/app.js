import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ================= TELA ================= */
function mostrar(id){
    ["login","dashboard","cadastro","sorteio"].forEach(t=>{
        document.getElementById(t).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
}

/* ================= LOGIN ================= */
window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth, email.value, senha.value);
    }catch(err){
        alert("Erro: " + err.code);
    }
};

window.logout = ()=> signOut(auth);

onAuthStateChanged(auth,(u)=>{
    if(u){
        mostrar("dashboard");
        carregarConsorcios();
    } else {
        mostrar("login");
    }
});

/* ================= PARTICIPANTES ================= */
window.gerarParticipantes = ()=>{
    participantes.innerHTML="";
    for(let i=0;i<qtd.value;i++){
        participantes.innerHTML+=`<input class="p" placeholder="Nome ${i+1}">`;
    }
};

/* ================= SALVAR ================= */
window.salvarConsorcio = async ()=>{

    let nomes=[...document.querySelectorAll(".p")].map(e=>e.value);

    await addDoc(collection(db,"consorcios"),{
        nome:nome.value,
        pessoas:nomes,
        inicio:inicio.value,
        fim:fim.value,
        uid:auth.currentUser.uid,
        sorteados:[]
    });

    alert("Consórcio salvo!");

    mostrar("dashboard");
    carregarConsorcios();
};

/* ================= LISTAR ================= */
async function carregarConsorcios(){

    let q=query(collection(db,"consorcios"),
        where("uid","==",auth.currentUser.uid));

    let snap=await getDocs(q);

    listaConsorcios.innerHTML="";

    snap.forEach(docSnap=>{
        let d=docSnap.data();

        listaConsorcios.innerHTML+=`
            <div class="item">
                <b>${d.nome}</b>
                <button onclick="abrirConsorcio('${docSnap.id}')">Abrir</button>
            </div>
        `;
    });
}

/* ================= ABRIR ================= */
let atual = null;
let atualId = null;

window.abrirConsorcio = async (id)=>{

    atualId = id;

    let snap = await getDocs(collection(db,"consorcios"));

    snap.forEach(docSnap=>{
        if(docSnap.id === id){
            atual = docSnap.data();
        }
    });

    titulo.innerText = atual.nome;

    mostrar("sorteio");
};

/* ================= GERAR MESES ================= */
function gerarMeses(inicio,fim){
    let meses=[];
    let d=new Date(inicio);
    let f=new Date(fim);

    while(d<=f){
        meses.push(d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}));
        d.setMonth(d.getMonth()+1);
    }

    return meses;
}

/* ================= SORTEAR ================= */
window.sortear = async ()=>{

    let meses = gerarMeses(atual.inicio, atual.fim);

    let disponiveis = atual.pessoas.filter(p=>!atual.sorteados.includes(p));

    if(disponiveis.length === 0){
        alert("Todos já foram sorteados!");
        return;
    }

    roleta.classList.add("girando");

    let i = 0;

    let intervalo = setInterval(()=>{
        roleta.innerText = disponiveis[i % disponiveis.length];
        i++;
    }, 100);

    setTimeout(async ()=>{

        clearInterval(intervalo);
        roleta.classList.remove("girando");

        let sorteado = disponiveis[Math.floor(Math.random()*disponiveis.length)];
        let mes = meses[atual.sorteados.length];

        atual.sorteados.push(sorteado);

        nomeSorteado.innerText = sorteado;
        mesSorteado.innerText = "Contemplado(a) em " + mes;

        roleta.innerText = sorteado;

        confetti({
            particleCount: 150,
            spread: 70
        });

        await updateDoc(doc(db,"consorcios",atualId),{
            sorteados: atual.sorteados
        });

    }, 2000);
};

/* ================= EDITAR ================= */
window.editarConsorcio = ()=>{
    nome.value = atual.nome;
    qtd.value = atual.pessoas.length;
    inicio.value = atual.inicio;
    fim.value = atual.fim;

    gerarParticipantes();

    document.querySelectorAll(".p").forEach((e,i)=>{
        e.value = atual.pessoas[i];
    });

    mostrar("cadastro");
};

/* ================= NAV ================= */
window.abrirCadastro = ()=>mostrar("cadastro");
window.voltar = ()=>mostrar("dashboard");
