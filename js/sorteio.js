export function gerarMeses(inicio, fim){

    let meses = [];

    let [anoI, mesI] = inicio.split("-");
    let [anoF, mesF] = fim.split("-");

    let data = new Date(anoI, mesI - 1, 1);
    let fimDate = new Date(anoF, mesF - 1, 1);

    while(data <= fimDate){
        meses.push(
            data.toLocaleDateString('pt-BR',{
                month:'long',
                year:'numeric'
            })
        );

        data.setMonth(data.getMonth() + 1);
    }

    return meses;
}

export function sortearItem(lista, usados){
    let disponiveis = lista.filter(p=>!usados.includes(p));
    return disponiveis[Math.floor(Math.random()*disponiveis.length)];
}