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
  getDoc,
  updateDoc,
  deleteDoc
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
    await signInWithEmailAndPassword(auth, email.value, senha.value);
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

/* ================= GERAR PARTICIPANTES ================= */
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

    alert("Salvo!");
    mostrar("dashboard");
    carregarConsorcios();
};

/* ================= LISTAR ================= */
async function carregarConsorcios(){

    let q = query(
        collection(db,"consorcios"),
        where("uid","==",auth.currentUser.uid)
    );

    let snap = await getDocs(q);

    listaConsorcios.innerHTML="";

    snap.forEach(docSnap=>{
        let d = docSnap.data();

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

    const snap = await getDoc(doc(db,"consorcios",id));

    atual = snap.data();

    titulo.innerText = atual.nome;

    /* carregar dropdown manual */
    manualPessoa.innerHTML = "";
    atual.pessoas.forEach(p=>{
        manualPessoa.innerHTML += `<option>${p}</option>`;
    });

    mostrar("sorteio");
};

/* ================= MESES ================= */
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

/* ================= SORTEIO AUTOMÁTICO ================= */
window.sortear = async ()=>{

    let meses = gerarMeses(atual.inicio, atual.fim);

    let disponiveis = atual.pessoas.filter(p=>!atual.sorteados.includes(p));

    if(disponiveis.length === 0){
        alert("Finalizado!");
        return;
    }

    let sorteado = disponiveis[Math.floor(Math.random()*disponiveis.length)];
    let mes = meses[atual.sorteados.length];

    atual.sorteados.push(sorteado);

    nomeSorteado.innerText = sorteado;
    mesSorteado.innerText = "Contemplado(a) em " + mes;

    await updateDoc(doc(db,"consorcios",atualId),{
        sorteados: atual.sorteados
    });
};

/* ================= SORTEIO MANUAL ================= */
window.sortearManual = async ()=>{

    let meses = gerarMeses(atual.inicio, atual.fim);

    let pessoa = manualPessoa.value;

    if(atual.sorteados.includes(pessoa)){
        alert("Já sorteado!");
        return;
    }

    let mes = meses[atual.sorteados.length];

    atual.sorteados.push(pessoa);

    nomeSorteado.innerText = pessoa;
    mesSorteado.innerText = "Contemplado(a) em " + mes;

    await updateDoc(doc(db,"consorcios",atualId),{
        sorteados: atual.sorteados
    });
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

/* ================= EXCLUIR ================= */
window.excluirConsorcio = async ()=>{

    if(!confirm("Excluir consórcio?")) return;

    await deleteDoc(doc(db,"consorcios",atualId));

    alert("Excluído!");

    mostrar("dashboard");
    carregarConsorcios();
};

/* ================= NAV ================= */
window.abrirCadastro = ()=>mostrar("cadastro");
window.voltar = ()=>mostrar("dashboard");
