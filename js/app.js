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
    ["login","dashboard","cadastro","consorcio"].forEach(t=>{
        document.getElementById(t).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
}

/* ================= LOGIN ================= */

window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth,email.value,senha.value);
    }catch(e){
        alert("Erro login: "+e.code);
    }
};

window.logout = ()=> signOut(auth);

onAuthStateChanged(auth,(u)=>{
    if(u){
        userEmail.innerText = u.email;
        mostrar("dashboard");
        carregar();
    } else {
        mostrar("login");
    }
});

/* ================= PARTICIPANTES ================= */

window.gerarParticipantes = ()=>{
    participantes.innerHTML="";
    for(let i=0;i<qtd.value;i++){
        participantes.innerHTML+=`
        <input class="p" placeholder="Nome ${i+1}" 
        oninput="this.value=this.value.toUpperCase()">`;
    }
};

/* ================= SALVAR ================= */

window.salvarConsorcio = async ()=>{

    let nomes=[...document.querySelectorAll(".p")].map(e=>e.value);

    if(nomes.length === 0){
        alert("Preencha participantes");
        return;
    }

    await addDoc(collection(db,"consorcios"),{
        nome:nome.value,
        pessoas:nomes,
        inicio:inicio.value,
        fim:fim.value,
        uid:auth.currentUser.uid,
        sorteios:[]
    });

    alert("Salvo!");

    mostrar("dashboard");
    carregar();
};

/* ================= LISTAR ================= */

let consorcios=[];
let atual=null;
let atualId=null;

async function carregar(){

    listaConsorcios.innerHTML="";

    let q=query(collection(db,"consorcios"),
        where("uid","==",auth.currentUser.uid));

    let snap=await getDocs(q);

    consorcios=[];

    snap.forEach(docSnap=>{
        let d=docSnap.data();

        consorcios.push({
            id:docSnap.id,
            ...d
        });
    });

    consorcios.forEach(c=>{
        listaConsorcios.innerHTML+=`
            <div class="card-item" onclick="abrir('${c.id}')">
                ${c.nome}
            </div>
        `;
    });
}

/* ================= ABRIR ================= */

window.abrir = async (id)=>{

    atualId=id;

    let snap=await getDoc(doc(db,"consorcios",id));
    atual=snap.data();

    if(!atual.sorteios) atual.sorteios=[];

    titulo.innerText=atual.nome;

    renderTabela();

    mostrar("consorcio");
};

/* ================= GERAR MESES ================= */

function gerarMeses(i,f){
    let meses=[];
    let d=new Date(i);
    let fim=new Date(f);

    while(d<=fim){
        meses.push(
            d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
        );
        d.setMonth(d.getMonth()+1);
    }

    return meses;
}

/* ================= TABELA ================= */

function renderTabela(){

    let meses=gerarMeses(atual.inicio,atual.fim);

    tabela.innerHTML="";

    meses.forEach((mes,i)=>{

        let pessoa = atual.sorteios[i]?.pessoa || "";

        tabela.innerHTML+=`
        <div class="linha-tabela">

            <span>${mes}</span>

            <select onchange="salvarManual(${i},this.value)">
                <option value="">--</option>
                ${atual.pessoas.map(p=>
                    `<option ${p===pessoa?"selected":""}>${p}</option>`
                ).join("")}
            </select>

        </div>
        `;
    });
}

/* ================= SORTEIO ================= */

window.sortear = async ()=>{

    let usados = atual.sorteios.map(s=>s.pessoa);

    let livres = atual.pessoas.filter(p=>!usados.includes(p));

    if(livres.length === 0){
        alert("Todos já sorteados");
        return;
    }

    let index = atual.sorteios.length;

    let pessoa = livres[Math.floor(Math.random()*livres.length)];

    atual.sorteios[index] = { pessoa };

    await salvar();
};

/* ================= MANUAL ================= */

window.salvarManual = async (i,pessoa)=>{

    atual.sorteios[i] = { pessoa };

    await salvar();
};

/* ================= SALVAR ================= */

async function salvar(){
    await updateDoc(doc(db,"consorcios",atualId),{
        sorteios:atual.sorteios
    });

    renderTabela();
}

/* ================= RESET ================= */

window.resetar = async ()=>{
    if(!confirm("Resetar sorteio?")) return;

    atual.sorteios=[];

    await salvar();
};

/* ================= EXCLUIR ================= */

window.excluir = async ()=>{
    if(!confirm("Excluir consórcio?")) return;

    await deleteDoc(doc(db,"consorcios",atualId));

    alert("Excluído!");

    mostrar("dashboard");
    carregar();
};

/* ================= IMAGEM ================= */

window.gerarImagem = async ()=>{

    tituloImagem.innerText = atual.nome;

    listaImagem.innerHTML="";

    atual.sorteios.forEach((s,i)=>{
        listaImagem.innerHTML += `
            <div>📅 ${i+1}º mês → <b>${s.pessoa}</b></div>
        `;
    });

    areaImagem.classList.remove("hidden");

    let canvas = await html2canvas(areaImagem);

    areaImagem.classList.add("hidden");

    let link=document.createElement("a");
    link.download="resultado.png";
    link.href=canvas.toDataURL();
    link.click();
};

/* ================= NAV ================= */

window.abrirCadastro = ()=>mostrar("cadastro");
window.voltar = ()=>mostrar("dashboard");
