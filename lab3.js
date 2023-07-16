//player 1 as at bottom
//player 2 as at top

const row=8;//quantity of cells in a row
const col=8;//quantity of cells in a column

var upperText=document.querySelector('.upperText');
var sidebar=document.querySelector('.sidebar');
var castlePanel=document.querySelector('.castlePanel');
var turnTitle=document.querySelector('.turnPanel .turnTitle');
var timer1_div=document.querySelector('.leftPanel .timersPanel .timer1');
var timer2_div=document.querySelector('.leftPanel .timersPanel .timer2');

var formPanel=document.querySelector('.formPanel');

var newGamePanel=document.querySelector('.newGame');//before accessing newGamePanel you need to show formPanel
var qtChartSection=document.getElementById('qtChartSection');
var leaveFeedbackPanel=document.querySelector('.leaveFeedback');//before accessing leaveFeedbackPanel you need to show formPanel


var chart;

var timer;
var curTimerPanel;

var mustMove=false;

var tds=[];

var field=[];//player + piece ('1P' - pawn of first player, '2K' - king of second player)
var allowedSteps=[];
var canBeat=[];

var check=[false,false];//shows what player claimed Check; first is true if player 1 claimed Check
var checkPath=[];//shows the path that enemy piece needs to go through to kill our King (the first id is piece's which claimed Check)

var castle=[[true,true],[true,true],[true,true]];//the first array is ability of players to do castling; the second and third arrays are two players and their ability to do left and right castling

var pawnTransform=[];//targetId and panel with extra pieces (where user chooses one to their piece to turn into)

var turn=2;
var arcade=true;

var enPassant=-1;

var colorP1='b';

function initializing(){
    //creates and adds cells to the chess-board and sets digits and letters
    let chessBoard=document.querySelector('.chess-board');
    let tr;
    let ind=0;
    let spans=new Array(row);
    for(let i=0;i<col;i++){
        tr=document.createElement('tr');
        chessBoard.appendChild(tr);
        for(let j=0;j<row;j++){
            tds[ind]=document.createElement('td');
            tr.appendChild(tds[ind]);

            if(j==0){//sets numbers to cells
                span=document.createElement('span');
                span.innerHTML=i+1;
                span.classList.add('digit');
                tds[ind].appendChild(span);

                if(i%2==0)
                    span.style='color:#769656';
                else
                    span.style='color:#EEEED2';
            }

            if(i==col-1){
                spans[j]=document.createElement('span');
                spans[j].classList.add('letter');
                tds[ind].appendChild(spans[j]);

                if(j%2==0)
                    spans[j].style='color:#EEEED2';
                else
                    spans[j].style='color:#769656';
            }

            ind++;
        }

        
    }

    //sets letters to the field cells
    spans[0].innerHTML='h';
    spans[1].innerHTML='g';
    spans[2].innerHTML='f';
    spans[3].innerHTML='e';
    spans[4].innerHTML='d';
    spans[5].innerHTML='c';
    spans[6].innerHTML='b';
    spans[7].innerHTML='a';

    //sets id to each td
    for(let i=0;i<tds.length;i++)
        tds[i].id=i;


    //sets sidebar with pictures
    let imgs=sidebar.querySelectorAll('img');
    for(let i=0;i<imgs.length;i++)
        imgs[i].onclick=pawnTransformation;

    
    drawChart();
}

function predefinedSet(){
    //clears the field
    for(let i=0;i<tds.length;i++)
        field[i]='00';

    //removes images from the field
    let img;
    for(let i=0;i<tds.length;i++){
        img=tds[i].querySelector('img');
        if(img!=undefined)
            tds[i].removeChild(img);
    }

    //sets pieces on the field
    let paths=new Array(row*col);
    paths[0]='wKing';
    paths[3]='wRook';
    paths[5]='wRook';
    paths[9]='wPawn';
    paths[13]='wQueen';
    paths[14]='wBishop';
    paths[16]='wPawn';
    paths[18]='wPawn';
    paths[22]='bBishop';
    paths[23]='wPawn';

    paths[10]='bPawn';
    paths[27]='wN_Knight';
    paths[54]='wPawn';
    paths[55]='wPawn';

    paths[30]='wPawn';
    paths[31]='bPawn';
    paths[35]='bBishop';
    paths[38]='wBishop';
    paths[40]='bPawn';
    paths[43]='bRook';
    paths[49]='bPawn';
    paths[50]='bPawn';
    paths[51]='bRook';
    paths[57]='bKing';
    paths[60]='bQueen';

    //set images
    for(let i=0;i<paths.length;i++){
        if(paths[i]!=undefined){
            img=new Image();
            img.src=paths[i]+'.png';
            img.id=paths[i]+i;
            img.draggable=true;
            img.ondragstart=drag;
            tds[i].appendChild(img);
        }
    }

    fillField();

    castle=[[false,false],[false,false],[false,false]];
    // castlePanel.style.setProperty('top','0');

    turnTitle.innerHTML='Arcade mode';
    turnTitle.style.removeProperty('color');

    mustMove=false;
}

function startGame(){
    //clears the field
    for(let i=0;i<tds.length;i++)
        field[i]='00';

    //removes images from the field
    let img;
    for(let i=0;i<tds.length;i++){
        img=tds[i].querySelector('img');
        if(img!=undefined)
            tds[i].removeChild(img);
    }

    //sets pieces on the field
    let paths=new Array(row*col);
    paths[0]='Rook';
    paths[1]='N_Knight';
    paths[2]='Bishop';
    if(colorP1=='w'){
        paths[3]='Queen';
        paths[4]='King';
    }
    else{
        paths[3]='King';
        paths[4]='Queen'; 
    }
    paths[5]='Bishop';
    paths[6]='N_Knight';
    paths[7]='Rook';

    paths[56]='Rook';
    paths[57]='N_Knight';
    paths[58]='Bishop';
    if(colorP1=='w'){
        paths[59]='Queen';
        paths[60]='King';
    }
    else{
        paths[59]='King';
        paths[60]='Queen';
    }
    paths[61]='Bishop';
    paths[62]='N_Knight';
    paths[63]='Rook';

    for(let i=0;i<row;i++){//sets pawns
        paths[row+i]='Pawn';
        paths[48+i]='Pawn';
    }

    for(let i=0;i<2*row;i++){
        if(colorP1=='w'){//player 1 is at bottom
            paths[i]='b'+paths[i];
            paths[48+i]='w'+paths[48+i];
        }
        else{
            paths[i]='w'+paths[i];
            paths[48+i]='b'+paths[48+i];
        }
    }

    //sets images
    for(let i=0;i<paths.length;i++){
        if(paths[i]!=undefined){
            img=new Image();
            img.src=paths[i]+'.png';
            img.id=paths[i]+i;
            img.draggable=true;
            img.ondragstart=drag;
            tds[i].appendChild(img);
        }
    }

    fillField();

    if(colorP1=='b'){
        turn=2;
        castlePanel.style.setProperty('top','0');
    }
    else{
        turn=1; 
        castlePanel.style.removeProperty('top');
    }

    turnTitle.innerHTML='White move';
    turnTitle.style.removeProperty('color');

    //clears all attributes
    arcade=false;
    enPassant=-1;
    check=[false,false];
    checkPath.length=0;
    castle=[[true,true],[true,true],[true,true]];
    allowedSteps.length=0;
    canBeat.length=0;
}

function fillField(){
    for(let i=0;i<tds.length;i++){
        img=tds[i].querySelector('img');
        if(img!=undefined){
            if(img.id[0]==colorP1)
                var player=1;
            else
                var player=2;

            field[i]=player+img.id[1];
        }
    }
}


function drawChart(){  
    var ctx = document.getElementById('piecesQtChart');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pawn', 'Rook', 'Knight', 'Bishop', 'Qween', 'King'],
            datasets: [{
                label: 'quantity of pieces',
                data: [11, 4, 1, 4, 2, 2],
                backgroundColor: [
                    'rgba(0, 156, 26, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ]
            }]
        },
        options: {
            scaleFontColor: 'rgb(255, 0, 0)',
            legend: {
                display: true,
                labels: {
                    fontColor: 'rgb(255, 255, 255)',
                }
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            max:16,
                            stepSize: 1,
                            fontColor: 'rgb(255, 255, 255)'
                        },
                        gridLines: {
                            color: 'rgb(0, 0, 0)'
                        }
                    },
                    {
                        position:'right',
                        ticks: {
                            beginAtZero: true,
                            max:16,
                            
                            stepSize: 1,
                            fontColor: 'rgb(255, 255, 255)'
                        },
                        gridLines: {
                            display: false,
                            color: 'rgb(0, 0, 0)'
                        }
                    }
                ],
                xAxes: [
                    {
                        ticks: {
                            fontColor: 'rgb(255, 255, 255)'
                        },
                        gridLines: {
                            color: 'rgb(0, 0, 0)'
                        }
                    }
                ]
            }
        }
    });
}

function fillChartOnGameStart(){
    chart.data.datasets[0].data[0]=16;
    chart.data.datasets[0].data[1]=4;
    chart.data.datasets[0].data[2]=4;
    chart.data.datasets[0].data[3]=4;
    chart.data.datasets[0].data[4]=2;
    chart.data.datasets[0].data[5]=2;
    chart.update();
}

initializing();
predefinedSet();
// startGame();
//--------------------------------------------------------------------------------------
//game functions

function pawnTransformation(ev){
    const fromId=pawnTransform[0];
    const player=field[fromId][0];
    const piecesPanel=pawnTransform[1];
    const img=ev.target;
    const oldImg=tds[fromId].querySelector('img');

    //fills the new img
    const imgCopy=img.cloneNode();
    imgCopy.id=oldImg.id;
    imgCopy.draggable=true;
    imgCopy.ondragstart=drag;

    //alters images
    tds[fromId].removeChild(oldImg);
    tds[fromId].appendChild(imgCopy);

    field[fromId]=player+img.id[1];

    changeChart(1,img.id[1])

    //hides sidebar and text in upperPanel
    upperText.style='display:none';
    sidebar.querySelector(piecesPanel).style='display:none';

    //restores the turn as it is 0 in order the players couldn't make a move until the piece in which the pawn will turn into is selected
    turn=player;

    //does last things of drop method that wasn't done yet
    testAndSetCheck(player);
    changeTurn();
}

//doesn't use row and col, but is tight to indexes written manually
function clickCastle(ev){
    if(turn==0)
        return;

    const dir=ev.target.id[0];
    const inc=(dir=='l'?-1:1);
    const whichRook=(dir=='l'?0:1);

    //checks that castling is possible

    if(check[2-turn])//if Check
        return;

    if(castle[turn][whichRook]==false)//if King or Rook have already made a move
        return;

    //finds the King that haven't made a move yet
    let indKing;
    if(turn==1){//at bottom
        if(colorP1=='w')
            indKing=60;
        else
            indKing=59;
    }
    else{//at top
        if(colorP1=='w')
            indKing=4;
        else
            indKing=3;
    }

    //finds the Rook that haven't made a move yet
    let indRook;
    if(turn==1)//at bottom
        indRook=(whichRook==0?56:63);
    else//at top
        indRook=(whichRook==0?0:7);

    //there must be no piece between King and Rook
    let move=indKing+inc;
    while(move!=indRook){
        if(field[move]!='00'){//if there is a piece between King and Rook
            return;
        }

        move+=inc;
    }


    //King cannot go while castling through beaten cells
    const cell1=indKing+inc;
    const cell2=indKing+2*inc;
    for(let i=0;i<field.length;i++){
        if(field[i][0]!=turn){
            if(field[i][1]=='P')
                calculatePawnPossibleBeat(i,turn-1);
            else
                findPossibleMoves(i,turn-1);

            if(allowedSteps.includes(cell1) || allowedSteps.includes(cell2))//if King is under attack while castling
                return;
        }
    }

    //does castling
    field[cell2]=field[indKing];
    field[indKing]='00';
    field[cell1]=field[indRook];
    field[indRook]='00';

    tds[cell2].appendChild(tds[indKing].querySelector('img'));
    tds[cell1].appendChild(tds[indRook].querySelector('img'));

    castle[turn][0]=false;
    castle[turn][1]=false;
    castle[0][turn-1]=false;
    changeTurn();
}

function allowDrop(ev){
    ev.preventDefault();
}

function drag(ev){
    const fromId=Number(ev.target.parentNode.id);
    const player=field[fromId][0];

    if(turn!=player && !arcade)
        return;

    ev.dataTransfer.setData('fromId', fromId);

    findPossibleMoves(fromId,player);

    if(check[2-player])
        excludeEndangeredCheckMoves(fromId,player);
    else
        excludeEndangeredMoves(fromId,player);

    for(let i=0;i<allowedSteps.length;i++){
        tds[allowedSteps[i]].classList.add('green');
    }

    let img;
    for(let i=0;i<canBeat.length;i++){
        img=tds[canBeat[i]].querySelector('img');
        if(img!=undefined)//for enPassant
            img.classList.add('forbidDrag');
        tds[canBeat[i]].classList.add('red');
    }

    if(mustMove && (allowedSteps.length!=0 || canBeat.length!=0))
        tds[fromId].classList.add('orange');
}

//clears green and red borders as drop isn't called all the time but when the image has started moving, but dragend will definetely work when mouse button dropped
function dragend(ev){
    ev.preventDefault();

    //clears possible moves
    for(let i=0;i<allowedSteps.length;i++){
        tds[allowedSteps[i]].classList.remove('green');
    }

    let img;
    for(let i=0;i<canBeat.length;i++){
        img=tds[canBeat[i]].querySelector('img');
        if(img!=undefined)//for enPassant
            img.classList.remove('forbidDrag');
        tds[canBeat[i]].classList.remove('red');
    }
}

function drop(ev){
    ev.preventDefault();

    let targetId=Number(ev.target.id);
    let fromId=ev.dataTransfer.getData('fromId');

    let moveDone=false;

    if(fromId!='' && !isNaN(targetId)){
        let player=field[fromId][0];
        if(allowedSteps.includes(targetId)){//can go to specific cell           
            tds[targetId].appendChild(tds[fromId].querySelector('img'));

            field[targetId]=field[fromId];
            field[fromId]='00';

            moveDone=true;
        }
        else{
            if(canBeat.includes(targetId)){//can beat a piece
                if(enPassant!=-1 && field[fromId][1]=='P' && ( (player==1 && targetId==enPassant-row) || (player==2 && targetId==enPassant+row) )){
                    tds[targetId].appendChild(tds[fromId].querySelector('img'));
                    tds[enPassant].removeChild(tds[enPassant].querySelector('img'));

                    field[enPassant]='00';
                }
                else{
                    tds[targetId].removeChild(tds[targetId].querySelector('img'));
                    tds[targetId].appendChild(tds[fromId].querySelector('img'));
                }

                changeChart(0,field[targetId][1]);


                field[targetId]=field[fromId];
                field[fromId]='00';

                moveDone=true;
            }
        }
    }

    let steps=allowedSteps.slice();
    let beats=canBeat.slice();

    if(moveDone){
        const player=Number(field[targetId][0]);
        const enemy=3-player;//1 or 2
        const piece=field[targetId][1];

        //for condition: if you've taken a piece, you must make a move
        if(tds[fromId].classList.contains('orange')){
            tds[fromId].classList.remove('orange');
            for(let i=0;i<field.length;i++){
                if(field[i][0]==turn)
                    tds[i].querySelector('img').classList.remove('forbidDrag');
            }
        }

        //if it was Check and there was done a move - Check no longer exists
        if(check[enemy-1]){
            check[enemy-1]=false;
            checkPath.length=0;

            upperText.style='display:none';
        }

        //if King or Rook made a move - not possible to do castling anymore (particularly or fully)
        if(piece=='K' || piece=='R'){
            if(piece=='K'){
                castle[player][0]=false;
                castle[player][1]=false;
                castle[0][player-1]=false;
                castlePanel.style="display:none";
            }
            else{
                //it doesn't work correcty!!!!! When enemy rook is at bottom (we're at bottom) and it makes a move from button, we can still make castling, but the code forbids it. It must be fixed!!
                //fixed but should be tested!
                if(player==1){
                    if(fromId==56)//left Rook made a move
                        castle[player][0]=false;
                    else
                        if(fromId==63)//right Rook made a move
                            castle[player][1]=false;
                }
                else{
                    if(fromId==0)//left Rook made a move
                        castle[player][0]=false;
                    else
                        if(fromId==7)//right Rook made a move
                            castle[player][1]=false;
                }

                if(castle[player][0]==false && castle[player][1]==false){
                    castle[0][player-1]=false;
                    castlePanel.style="display:none";
                }
            }
        }

        //to do en passant possible for only one stroke 
        enPassant=-1;

        //if it's possible to do en passant
        if(piece=='P')
            if((player==1 && fromId-targetId==2*row) || (player==2 && targetId-fromId==2*row))
                enPassant=targetId;



        //if a Pawn reached the end of board (it can turn into any piece)
        if(piece=='P' && (targetId<row || targetId>=row*(col-1))){
            if(targetId<row){//player 1 is going to choose a piece
                pawnTransform[1]='.'+colorP1+'Pieces';
                sidebar.querySelector(pawnTransform[1]).style='display:block';
            }
            else{//player 2 is going to choose a piece
                pawnTransform[1]='.'+ (colorP1=='w'?'b':'w') +'Pieces';
                sidebar.querySelector(pawnTransform[1]).style='display:block';
            }
            upperText.innerHTML='Choose the piece that the pawn will turn into.';
            upperText.style='display:initial';

            turn=0;//no one can make a move while a person chooses a piece that the pawn will turn into
            pawnTransform[0]=targetId;//saves the id
            return;
        }

        testAndSetCheck(player);//checks if there is Check
        changeTurn();
    }
    else{
        //for condition: if you've taken a piece, you must make a move
        if(fromId!='' && tds[fromId].classList.contains('orange')){
            for(let i=0;i<field.length;i++){
                if(field[i][0]==turn)
                    tds[i].querySelector('img').classList.add('forbidDrag');
            }
            tds[fromId].querySelector('img').classList.remove('forbidDrag');
        }
    }
        
    allowedSteps=steps;
    canBeat=beats;
}



function findPossibleMoves(fromId,player){
    allowedSteps.length=0;
    canBeat.length=0;

    const enemy=3-player;
    const piece=field[fromId][1];

    if(piece=='P'){//Pawn
        const maxId=row*col;
        const rightBorder=row-1;
        const incRow=(player==1?-row:row);
        let move=fromId+incRow;

        //allowedSteps
        if(move>=0 && move<maxId && field[move]=='00'){
            allowedSteps.push(move);

            move=fromId+2*incRow;
            if((player==1 && fromId>=row*(col-2) && fromId<row*(col-1) && field[move]=='00') ||(player==2 && fromId>=row && fromId<row*2 && field[move]=='00'))//move on 2 cells
                allowedSteps.push(move);
        }

        //canBeat
        move=fromId+incRow;
        if(move>=0 && move<maxId){
            if(fromId%row!=0 && field[move-1][0]==enemy)//if it's not the left border and there is an enemy piece left above
                canBeat.push(move-1);
            if(fromId%row!=rightBorder && field[move+1][0]==enemy)//if it's not the right border and there is an enemy piece right above
                canBeat.push(move+1);

            //enPassant
            if(enPassant!=-1){
                if((fromId%row!=0 && fromId-1==enPassant) || (fromId%row!=rightBorder && fromId+1==enPassant))
                    canBeat.push(enPassant+incRow);
            }
        }
    }//end of pawn
    
    if(piece=='R'){//Rook
        findStraightMoves(fromId,enemy);
    }//end of rook

    if(piece=='N'){//Knight
        const maxId=row*col;
        const rightBorder=row-1;
        //2 above 1 right
        let move=fromId-2*row+1;//other checks in this if uses reletive calculations to each other (i.e. the next is move-=2)
        if(move>0 && fromId%row!=rightBorder){//if it's not the top and the right border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }

        //2 above 1 left
        move-=2;
        if(move>=0 && fromId%row!=0){//if it's not the top and the left border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }

        //2 down 1 right
        move=fromId+2*row+1;
        if(move<maxId && fromId%row!=rightBorder){//if it's not the bottom and the right border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }

        //2 down 1 left
        move-=2;
        if(move<maxId && fromId%row!=0){//if it's not the bottom and the left border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }

        //1 above 2 right
        move=fromId-row+2;
        if(move>0 && fromId%row<rightBorder-1){//if it's not the top and the right border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }

        //1 above 2 left
        move-=4;
        if(move>=0 && fromId%row>1){//if it's not the top and the left border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }

        //1 down 2 right
        move=fromId+row+2;
        if(move<maxId && fromId%row<rightBorder-1){//if it's not the bottom and the right border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }

        //1 down 2 left
        move-=4;
        if(move<maxId && fromId%row>1){//if it's not the top and the left border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }
    }//end of knight

    if(piece=='B'){//Bishop
        findDiagonalMoves(fromId,enemy);
    }//end of bishop

    if(piece=='Q'){//Queen
        findStraightMoves(fromId,enemy);
        findDiagonalMoves(fromId,enemy);
    }//end of queen

    if(piece=='K'){//King
        const maxId=row*col;
        const rightBorder=row-1;

        let move;//other checks in this if uses reletive calculations to each other

        //top
        move=fromId-row;
        if(move>=0){//not top border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }


        //top left
        move--;
        if(move>=0 && fromId%row!=0){//not top or left border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }

        //top right
        move+=2;
        if(move>0 && fromId%row!=rightBorder){//not top or right border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }


        //left
        move=fromId-1;
        if(fromId%row!=0){//not left border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }


        //right
        move=fromId+1;
        if(fromId%row!=rightBorder){//not right border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }
        

        //bottom
        move=fromId+row;
        if(move<maxId){//not bottom border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }


        //bottom left
        move--;
        if(move<maxId && fromId%row!=0){//not bottom or left border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }


        //bottom right
        move+=2;
        if(move<maxId && fromId%row!=rightBorder){//not bottom or right border
            if(field[move]=='00')
                allowedSteps.push(move);
            else
                if(field[move][0]==enemy)
                    canBeat.push(move);
        }


        //excludes moves that will put King under attack
        if(turn==player){
            let steps=allowedSteps.slice();
            let beats=canBeat.slice();

            const king=field[fromId];
            field[fromId]='00';

            //excludes allowedSteps
            for(let i=0;i<field.length;i++){
                if(field[i][0]==enemy){
                    if(field[i][1]=='P')
                        calculatePawnPossibleBeat(i,enemy);
                    else
                        findPossibleMoves(i,enemy);

                    for(let j=0;j<steps.length;){
                        if(allowedSteps.includes(steps[j])){//if King is under attack after this step
                            steps.splice(j,1);
                        }
                        else
                            j++;
                    }
                    if(steps.length==0)
                        break;
                }
            }

            //excludes canBeat
            let indSavedPiece;
            let savedPiece;
            for(let ps=0;ps<beats.length;ps++){
                indSavedPiece=beats[ps];
                savedPiece=field[indSavedPiece];
                field[indSavedPiece]=king;

                for(let i=0;i<field.length;i++){
                    if(field[i][0]==enemy){
                        findPossibleMoves(i,enemy);

                        if(canBeat.includes(indSavedPiece)){//if King is under attack after this beat
                            beats.splice(ps,1);
                            ps--;
                            break;
                        }
                    }
                }

                field[indSavedPiece]=savedPiece;
            }


            field[fromId]=king;

            allowedSteps=steps;
            canBeat=beats;
        }

    }//end of king
}

function findStraightMoves(fromId,enemy){
    const maxId=row*col;

    //from down to top
    let move=fromId-row;
    while(move>=0 && field[move]=='00'){
        allowedSteps.push(move);
        move-=row;
    }
    if(move>=0 && field[move][0]==enemy)
        canBeat.push(move);


    //from top to down
    move=fromId+row;
    while(move<maxId && field[move]=='00'){
        allowedSteps.push(move);
        move+=row;
    }
    if(move<maxId && field[move][0]==enemy)
        canBeat.push(move);

    //from right to left
    move=fromId-1;
    let limit=~~(fromId/row)*row;
    while(move>=limit && field[move]=='00'){
        allowedSteps.push(move);
        move--;
    }
    if(move>=limit && field[move][0]==enemy)
        canBeat.push(move);

    //from left to right
    move=fromId+1;
    limit=(~~(fromId/row)+1)*row;
    while(move<limit && field[move]=='00'){
        allowedSteps.push(move);
        move++;
    }
    if(move<limit && field[move][0]==enemy)
        canBeat.push(move);
}

function findDiagonalMoves(fromId,enemy){
    const maxId=row*col;
    const rightBorder=row-1;

    let move;

    //to top right
    if(fromId%row!=rightBorder){
        move=fromId-row+1;
        while(move>0 && move%row<=rightBorder && field[move]=='00'){
            allowedSteps.push(move);

            if(move%row==rightBorder)
                break;

            move+=-row+1;
        }
        if(move>0 && field[move][0]==enemy)
            canBeat.push(move);
    }


    //to top left
    if(fromId%row!=0){
        move=fromId-row-1;
        while(move>=0 && move%row>=0 && field[move]=='00'){
            allowedSteps.push(move);

            if(move%row==0)
                break;

            move+=-row-1;
        }
        if(move>=0 && field[move][0]==enemy)
            canBeat.push(move);
    }

    //to bottom right
    if(fromId%row!=rightBorder){
        move=fromId+row+1;
        while(move<maxId && move%row<=rightBorder && field[move]=='00'){
            allowedSteps.push(move);

            if(move%row==rightBorder)
                break;

            move+=row+1;
        }
        if(move<maxId && field[move][0]==enemy)
            canBeat.push(move);
    }

    //to bottom left
    if(fromId%row!=0){
        move=fromId+row-1;
        while(move<maxId && move%row>=0 && field[move]=='00'){
            allowedSteps.push(move);

            if(move%row==0)
                break;

            move+=row-1;
        }
        if(move<maxId && field[move][0]==enemy)
            canBeat.push(move);
    }
}

function calculatePawnPossibleBeat(fromId,player){
    allowedSteps.length=0;
    canBeat.length=0;

    const incRow=(player==1?-row:row);
    let move=fromId+incRow;
    if(move>=0 && move<row*col){
        if(fromId%row!=0)//if it's not the left border
            allowedSteps.push(move-1);
        if(fromId%row!=row-1)//if it's not the right border
            allowedSteps.push(move+1);
    }
}



function excludeEndangeredMoves(fromId,player){
    const fullPiece=field[fromId];
    const piece=fullPiece[1];
    const enemy=3-player;

    let steps=allowedSteps.slice();
    let beats=canBeat.slice();

    field[fromId]='00';

    //finds the King
    let indKing;
    for(let i=0;i<field.length;i++){
        if(field[i][1]=='K' && field[i][0]==player){
            indKing=i;
            break;
        }
    }
    
    if(piece=='P'){//Pawn
        const maxId=row*col;
        const incRow=(player==1?-row:row);

        if(steps.length!=0){
            let move=fromId+incRow;
            field[move]=fullPiece;

            for(let i=0;i<field.length;i++){
                if(field[i][0]==enemy){
                    findPossibleMoves(i,enemy);
                    if(canBeat.includes(indKing)){
                        steps.length=0;
                        break;
                    }

                }
            }
            field[move]='00';
        }

        if(beats.length!=0){
            let indSavedPiece;
            let savedPiece;
            for(let ps=0;ps<beats.length;ps++){
                indSavedPiece=beats[ps];
                savedPiece=field[indSavedPiece];
                field[indSavedPiece]=fullPiece;

                if(indSavedPiece-incRow==enPassant)//for en passant
                    field[enPassant]='00';

                for(let i=0;i<field.length;i++){
                    if(field[i][0]==enemy){
                        findPossibleMoves(i,enemy);
                        if(canBeat.includes(indKing)){
                            beats.splice(ps,1);
                            ps--;
                            break;
                        }
                    }
                }
                field[indSavedPiece]=savedPiece;

                if(indSavedPiece-incRow==enPassant)//for en passant
                    field[enPassant]=enemy+'P';
            }
        }
    }//end of pawn

    if(piece=='R'){//Rook
        const curCol=fromId%row;
        let vertical=[];
        let horizontal=[];
        let vertBeat=[];
        let horzBeat=[];

        //steps
        for(let i=0;i<steps.length;i++){
            if(steps[i]%row==curCol)
                vertical.push(steps[i]);
            else
                horizontal.push(steps[i]);
        }

        //beats
        for(let i=0;i<beats.length;i++){
            if(beats[i]%row==curCol)
                vertBeat.push(beats[i]);
            else
                horzBeat.push(beats[i]);
        }



        let savedPiece;

        //checks ability to move vertically
        let move=undefined;
        if(vertical.length!=0)
            move=vertical[0];
        else
            if(vertBeat.length!=0)
                move=vertBeat[0];

        if(move!=undefined){
            savedPiece=field[move];
            field[move]=fullPiece;

            for(let i=0;i<field.length;i++){
                if(field[i][0]==enemy){
                    findPossibleMoves(i,enemy);
                    if(canBeat.includes(indKing)){
                        vertical.length=0;
                        vertBeat.length=0;
                        break;
                    }
                }
            }
            field[move]=savedPiece;
        }

        
        //checks ability to move horizontally
        move=undefined;
        if(horizontal.length!=0)
            move=horizontal[0];
        else
            if(horzBeat.length!=0)
                move=horzBeat[0];

        if(move!=undefined){
            savedPiece=field[move];
            field[move]=fullPiece;

            for(let i=0;i<field.length;i++){
                if(field[i][0]==enemy){
                    findPossibleMoves(i,enemy);
                    if(canBeat.includes(indKing)){
                        horizontal.length=0;
                        horzBeat.length=0;
                        break;
                    }
                }
            }
            field[move]=savedPiece;
        }

        steps=vertical.concat(horizontal);
        beats=vertBeat.concat(horzBeat);
    }//end of rook

    if(piece=='N'){//Knight
        if(steps.length!=0 || beats.length!=0){
            for(let i=0;i<field.length;i++){
                if(field[i][0]==enemy){
                    findPossibleMoves(i,enemy);
                    if(canBeat.includes(indKing)){
                        steps.length=0;
                        beats.length=0;
                        break;
                    }
                }
            }
        }
    }//end of knight

    if(piece=='B'){//Bishop
        const curCol=fromId%row;
        let topAxis=[];//left top - right bottom
        let bottomAxis=[];//left bottom - right top
        let topBeat=[];
        let bottomBeat=[];

        //steps
        for(let i=0;i<steps.length;i++){
            if(steps[i]<fromId){//top left or right
                if(steps[i]%row<curCol)//top left
                    topAxis.push(steps[i]);
                else//top right
                    bottomAxis.push(steps[i]);
            }
            else{//bottom left or right
                if(steps[i]%row<curCol)//bottom left
                    bottomAxis.push(steps[i]);
                else//bottom right
                    topAxis.push(steps[i]);
            }
        }

        //beats
        for(let i=0;i<beats.length;i++){
            if(beats[i]<fromId){//top left or right
                if(beats[i]%row<curCol)//top left
                    topBeat.push(beats[i]);
                else//top right
                    bottomBeat.push(beats[i]);
            }
            else{//bottom left or right
                if(beats[i]%row<curCol)//bottom left
                    bottomBeat.push(beats[i]);
                else//bottom right
                    topBeat.push(beats[i]);
            }
        }



        let savedPiece;

        //checks ability to move by top axis
        let move=undefined;
        if(topAxis.length!=0)
            move=topAxis[0];
        else
            if(topBeat.length!=0)
                move=topBeat[0];

        if(move!=undefined){
            savedPiece=field[move];
            field[move]=fullPiece;

            for(let i=0;i<field.length;i++){
                if(field[i][0]==enemy){
                    findPossibleMoves(i,enemy);
                    if(canBeat.includes(indKing)){
                        topAxis.length=0;
                        topBeat.length=0;
                        break;
                    }
                }
            }
            field[move]=savedPiece;
        }

        
        //checks ability to move by bottom axis
        move=undefined;
        if(bottomAxis.length!=0)
            move=bottomAxis[0];
        else
            if(bottomBeat.length!=0)
                move=bottomBeat[0];

        if(move!=undefined){
            savedPiece=field[move];
            field[move]=fullPiece;

            for(let i=0;i<field.length;i++){
                if(field[i][0]==enemy){
                    findPossibleMoves(i,enemy);
                    if(canBeat.includes(indKing)){
                        bottomAxis.length=0;
                        bottomBeat.length=0;
                        break;
                    }
                }
            }
            field[move]=savedPiece;
        }

        steps=topAxis.concat(bottomAxis);
        beats=topBeat.concat(bottomBeat);
    }//end of bishop

    if(piece=='Q'){//Queen
        const curCol=fromId%row;
        let vertical=[];
        let horizontal=[];
        let vertBeat=[];
        let horzBeat=[];

        let topAxis=[];//left top - right bottom
        let bottomAxis=[];//left bottom - right top
        let topBeat=[];
        let bottomBeat=[];

         //steps
         for(let i=0;i<steps.length;i++){
            if(steps[i]<fromId){//top or top right or top left or left
                if(steps[i]%row==curCol)//top
                    vertical.push(steps[i]);
                else
                    if(steps[i]%row>curCol)//top right
                        bottomAxis.push(steps[i]);
                    else
                        if(fromId-steps[i]<row)//left
                            horizontal.push(steps[i]);
                        else//top left
                            topAxis.push(steps[i]);
            }
            else{//bottom or bottom left or bottom right or right
                if(steps[i]%row==curCol)//bottom
                    vertical.push(steps[i]);
                else
                    if(steps[i]%row<curCol)//bottom left
                        bottomAxis.push(steps[i]);
                    else
                        if(steps[i]-fromId<row)//right
                            horizontal.push(steps[i]);
                        else//bottom right
                            topAxis.push(steps[i]);
            }
        }

        
        //beats
        for(let i=0;i<beats.length;i++){
            if(beats[i]<fromId){//top or top right or top left or left
                if(beats[i]%row==curCol)//top
                    vertBeat.push(beats[i]);
                else
                    if(beats[i]%row>curCol)//top right
                        bottomBeat.push(beats[i]);
                    else
                        if(fromId-beats[i]<row)//left
                            horzBeat.push(beats[i]);
                        else//top left
                            topBeat.push(beats[i]);
            }
            else{//bottom or bottom left or bottom right or right
                if(beats[i]%row==curCol)//bottom
                    vertBeat.push(beats[i]);
                else
                    if(beats[i]%row<curCol)//bottom left
                        bottomBeat.push(beats[i]);
                    else
                        if(beats[i]-fromId<row)//right
                            horzBeat.push(beats[i]);
                        else//bottom right
                            topBeat.push(beats[i]);
            }
        }



        let savedPiece;

        //checks ability to move vertically
        let move=undefined;
        if(vertical.length!=0)
            move=vertical[0];
        else
            if(vertBeat.length!=0)
                move=vertBeat[0];

        if(move!=undefined){
            savedPiece=field[move];
            field[move]=fullPiece;

            for(let i=0;i<field.length;i++){
                if(field[i][0]==enemy){
                    findPossibleMoves(i,enemy);
                    if(canBeat.includes(indKing)){
                        vertical.length=0;
                        vertBeat.length=0;
                        break;
                    }
                }
            }
            field[move]=savedPiece;
        }

        
        //checks ability to move horizontally
        move=undefined;
        if(horizontal.length!=0)
            move=horizontal[0];
        else
            if(horzBeat.length!=0)
                move=horzBeat[0];

        if(move!=undefined){
            savedPiece=field[move];
            field[move]=fullPiece;

            for(let i=0;i<field.length;i++){
                if(field[i][0]==enemy){
                    findPossibleMoves(i,enemy);
                    if(canBeat.includes(indKing)){
                        horizontal.length=0;
                        horzBeat.length=0;
                        break;
                    }
                }
            }
            field[move]=savedPiece;
        }


        //checks ability to move by top axis
        move=undefined;
        if(topAxis.length!=0)
            move=topAxis[0];
        else
            if(topBeat.length!=0)
                move=topBeat[0];

        if(move!=undefined){
            savedPiece=field[move];
            field[move]=fullPiece;

            for(let i=0;i<field.length;i++){
                if(field[i][0]==enemy){
                    findPossibleMoves(i,enemy);
                    if(canBeat.includes(indKing)){
                        topAxis.length=0;
                        topBeat.length=0;
                        break;
                    }
                }
            }
            field[move]=savedPiece;
        }

        
        //checks ability to move by bottom axis
        move=undefined;
        if(bottomAxis.length!=0)
            move=bottomAxis[0];
        else
            if(bottomBeat.length!=0)
                move=bottomBeat[0];

        if(move!=undefined){
            savedPiece=field[move];
            field[move]=fullPiece;

            for(let i=0;i<field.length;i++){
                if(field[i][0]==enemy){
                    findPossibleMoves(i,enemy);
                    if(canBeat.includes(indKing)){
                        bottomAxis.length=0;
                        bottomBeat.length=0;
                        break;
                    }
                }
            }
            field[move]=savedPiece;
        }

        steps=vertical.concat(horizontal,topAxis,bottomAxis);
        beats=vertBeat.concat(horzBeat,topBeat,bottomBeat);
    }//end of queen

    field[fromId]=fullPiece;

    allowedSteps=steps;
    canBeat=beats;
}

function excludeEndangeredCheckMoves(fromId,player){
    if(field[fromId][1]=='K')
        return;

    const enemy=3-player;

    //finds the King
    let indKing;
    for(let i=0;i<field.length;i++){
        if(field[i][1]=='K' && field[i][0]==player){
            indKing=i;
            break;
        }
    }


    //excluds moves without checking whether the King will be under threat if the piece makes a move

    //excludes allowedSteps
    for(let i=0;i<allowedSteps.length;){
        if(!checkPath.includes(allowedSteps[i]))
            allowedSteps.splice(i,1);
        else
            i++;
    }

    //excludes canBeat
    let beatenPiece=undefined;
    if(enPassant==checkPath[0] && field[fromId][1]=='P' && (enPassant==fromId-1 || enPassant==fromId+1))//en passant
        beatenPiece=enPassant+(player==1?-row:row);
    else
        beatenPiece=canBeat.find(value => value==checkPath[0]);
    canBeat.length=0;
    if(beatenPiece!=undefined)
        canBeat.push(beatenPiece);



    //excludes moves minding that the King mustn't be under threat after making a move

    let fullPiece=field[fromId];
    field[fromId]='00';

    let steps=allowedSteps.slice();
    let beats=canBeat.slice();

    //excludes steps
    if(steps.length!=0){
        field[steps[0]]=fullPiece;

        for(let i=0;i<field.length;i++){
            if(field[i][0]==enemy){
                findPossibleMoves(i,enemy);
                if(canBeat.includes(indKing)){
                    steps.length=0;
                    break;
                }
            }
        }
        field[steps[0]]='00';
    }


    //excludes beats
    if(beats.length==1){
        let indSavedPiece=beats[0];
        let savedPiece=field[indSavedPiece];
        field[indSavedPiece]=fullPiece;

        if(beatenPiece!=undefined)//for en passant
            field[enPassant]='00';

        for(let i=0;i<field.length;i++){
            if(field[i][0]==enemy){
                findPossibleMoves(i,enemy);
                if(canBeat.includes(indKing)){
                    beats.length=0;
                    break;
                }
            }
        }
        field[indSavedPiece]=savedPiece;

        if(beatenPiece!=undefined)//for en passant
            field[enPassant]=enemy+'P';
    }

    field[fromId]=fullPiece;

    allowedSteps=steps;
    canBeat=beats;
}



function testAndSetCheck(player){
    const enemy=3-player;
    const fromId=indCheck(player);
    if(fromId!=-1){//Check
        check[player-1]=true;
        buildCheckPath(fromId,enemy);

        if(isCheckmate(player)){
            upperText.innerHTML=`Checkmate to ${enemy==1?(colorP1=='w'?'White':'Black'):(colorP1=='w'?'Black':'White')} King`;
            upperText.style='display:initial';
            turn=0;
        }
        else{
            upperText.innerHTML=`Check to ${enemy==1?(colorP1=='w'?'White':'Black'):(colorP1=='w'?'Black':'White')} King`;
            upperText.style='display:initial';
        }
    }
    else{
        if(isStalemate(player)){
            upperText.innerHTML='Stalemate to player '+enemy;
            upperText.style='display:initial';
            turn=0;
        }
    }
}

function indCheck(player){//player is 1 or 2
    for(let i=0;i<field.length;i++){
        if(field[i][0]==player){
            findPossibleMoves(i,player);
            if(canBeat.find(value => field[value][1]=='K')!=undefined){
                return i;
            }
        }
    }
    return -1;
}


//we need to find if the opponent has at least one available move 
function isCheckmate(player){
    turn=3-player;//enemy King must calculate possible moves taking into account that he can be beaten after his move, so such moves must be extracted
    const enemy=3-player;
    for(let i=0;i<field.length;i++){
        if(field[i][0]==enemy){
            findPossibleMoves(i,enemy);
            excludeEndangeredCheckMoves(i,enemy);
            if(allowedSteps.length!=0 || canBeat.length!=0){
                if(!arcade)
                    turn=player
                else
                    turn=2;
                return false;
            }
        }
    }
    if(!arcade)
        turn=player
    else
        turn=2;
    return true;
}


function isStalemate(player){
    turn=3-player;//enemy King must calculate possible moves taking into account that he can be beaten after his move, so such moves must be extracted
    const enemy=3-player;
    for(let i=0;i<field.length;i++){
        if(field[i][0]==enemy){
            findPossibleMoves(i,enemy);
            excludeEndangeredMoves(i,enemy);
            if(allowedSteps.length!=0 || canBeat.length!=0){
                if(!arcade)
                    turn=player
                else
                    turn=2;
                return false;
            }
        }
    }
    if(!arcade)
        turn=player
    else
        turn=2;
    return true;
}

//to save King there are two ways: either kill the piece that claimed Check or block the way it needs to go through to kill the King;
//Pawn and Knight beats King at once, the only way to save King - to kill them;
//Rook, Bishop and Queen can be either killed or get their way blocked;
//enemy King cannot claim Check to ours
function buildCheckPath(fromId,enemy){
    const piece=field[fromId][1];

    checkPath[0]=fromId;

    //finds the King
    let indKing;
    for(let i=0;i<field.length;i++){
        if(field[i][1]=='K' && field[i][0]==enemy){
            indKing=i;
            break;
        }
    }

    if(piece=='R'){//Rook
        let inc;
        if(indKing<fromId){//King is above or left
            if(indKing%row==fromId%row)//above
                inc=-row;
            else//left
                inc=-1;
        }
        else{//King is down or right
            if(indKing%row==fromId%row)//down
                inc=row;
            else//right
                inc=1;
        }

        //builds path
        let move=fromId+inc;
        while(move!=indKing){
            checkPath.push(move);
            move+=inc;
        }
    }//end of rook

    if(piece=='B'){//Bishop
        let inc;
        if(indKing<fromId){//King is above left or right
            if(indKing%row<fromId%row)//above left
                inc=-row-1;
            else//above right
                inc=-row+1;
        }
        else{//King is down left or right
            if(indKing%row<fromId%row)//down left
                inc=row-1;
            else//down right
                inc=row+1;
        }

        //builds path
        let move=fromId+inc;
        while(move!=indKing){
            checkPath.push(move);
            move+=inc;
        }
    }//end of bishop

    if(piece=='Q'){//Queen
        let inc;
        if(indKing<fromId){//King is above or above right or above left or left
            if(indKing%row==fromId%row)//above
                inc=-row;
            else
                if(indKing%row>fromId%row)//above right
                    inc=-row+1;
                else
                    if(fromId-indKing<row)//left
                        inc=-1;
                    else//above left
                        inc=-row-1;
        }
        else{//King is down or down left or down right or right
            if(indKing%row==fromId%row)//down
                inc=row;
            else
                if(indKing%row<fromId%row)//down left
                    inc=row-1;
                else
                    if(indKing-fromId<row)//right
                        inc=1;
                    else//down right
                        inc=row+1;
        }

        //builds path
        let move=fromId+inc;
        while(move!=indKing){
            checkPath.push(move);
            move+=inc;
        }
    }//end of queen
}


function changeTurn(){
    if(turn==0 || arcade)
        return;

    turn=3-turn;
    
    if(turn==2){//the next turn is second player's (at top)
        if(castle[0][turn-1]!=false){
            castlePanel.style='display:inherit';
            castlePanel.style.setProperty('top','0');
        }
        else
            castlePanel.style='display:none';//there is no castle panel when King or Rooks made a move
    }
    else{
        if(castle[0][turn-1]!=false){
            castlePanel.style='display:inherit';
            castlePanel.style.removeProperty('top');
        }
        else
            castlePanel.style='display:none';
    }

    if((turn==1 && colorP1=='w') || (turn==2 && colorP1!='w')){//White move
        turnTitle.innerHTML='White move';
        turnTitle.style.removeProperty('color');
    }
    else{//Black move
        turnTitle.innerHTML='Black move';
        turnTitle.style.setProperty('color','black');
    }

    changeTimer();
}

//------------------------------------------------------------------------------------------------------------------------
//user functions

function switchToNewGame(){
    formPanel.style='display:initial';
    newGamePanel.style='display:initial';
    qtChartSection.style='display:none';
    leaveFeedbackPanel.style='display:none';
    
    
}

function switchToGraphics(){
    formPanel.style='display:none';
    newGamePanel.style='display:none';
    qtChartSection.style='display:initial';
    leaveFeedbackPanel.style='display:none';
}

function switchToFeedback(){
    formPanel.style='display:initial';
    newGamePanel.style='display:none';
    qtChartSection.style='display:none';
    leaveFeedbackPanel.style='display:initial';
    
}



function changeChart(action,piece){
    let ind;
    switch(piece){
        case 'P':ind=0;
        break;
        case 'R':ind=1;
        break;
        case 'N':ind=2;
        break;
        case 'B':ind=3;
        break;
        case 'Q':ind=4;
        break;
        case 'K':ind=5;
        break;
    }

    if(action==0){//a piece was beaten and must be deleted from the chart
        chart.data.datasets[0].data[ind]--;
    }
    else{//a pawn was transformed into other piece
        chart.data.datasets[0].data[0]--;
        chart.data.datasets[0].data[ind]++;
    }
    chart.update();
}




function newGame(){
    //stops timer
    if(timer!=undefined){
        clearInterval(timer);
        timer=undefined;
    }

    //color
    const wBut=document.getElementById('wChooseColor');//.classList.remove('highlightedPiece');  
    if(wBut.classList.contains('highlightedPiece'))//the player is going to play by white pieces
        colorP1='w';
    else
        colorP1='b';

    //obligitary to make a move if you take a piece
    mustMove=document.getElementById('HaveToMoveCheckbox').checked;


    //timer
    const TimerSetCheckbox=document.getElementById('TimerSetCheckbox');
    if(TimerSetCheckbox.checked){
        initializeTimer();
        timer1_div.style="display:inherit";
        timer2_div.style="display:inherit";
    }
    else{
        curTimerPanel=undefined;
        timer1_div.style="display:none";
        timer2_div.style="display:none";
    }

    fillChartOnGameStart();

    //shows castle panel
    castlePanel.style="display:inherit";

    switchToGraphics();
    
    startGame();
    startTimer();
}



function initializeTimer(){
    const time=document.getElementById('Timer').value.slice(1);//without first zero at hour
    
    timer1_div.innerHTML=time;
    timer2_div.innerHTML=time;
    curTimerPanel=colorP1=='w'?timer1_div:timer2_div;
}

function startTimer(){
    if(curTimerPanel==undefined)
        return;

    let timeStr;
    let h,m,s;
    timer=setInterval(()=>{
        timeStr=curTimerPanel.innerHTML;//0:00:00 (h:mm:ss)
        s=Number(timeStr.slice(5,7));
        m=Number(timeStr.slice(2,4));
        h=Number(timeStr[0]);

        s--;
        if(s<0){//decreses minutes
            s=59;
            m--;
            if(m<0){//decreses hours
                m=59;      
                h--;
                if(h<0){//the time is over
                    s=0;
                    m=0;
                    h=0;
                    upperText.innerHTML=`The time is over. Player ${turn} lost.`;
                    upperText.style='display:initial';
                    turn=0;
                    clearInterval(timer);
                    timer=undefined;
                    curTimerPanel=undefined;
                }//end of hours
            }
        }

        if(s<10)
            s=String('0'+s);
        if(m<10)
            m=String('0'+m);

        curTimerPanel.innerHTML=`${h}:${m}:${s}`;
    },1000)
}

function changeTimer(){
    if(timer==undefined)
        return;

    clearInterval(timer);//when turn is changed, timer must begin calculating from 0 but not approximately 0.5
    curTimerPanel=turn==1?timer1_div:timer2_div;
    startTimer();
}



function chooseColor(ev){
    if(ev.target.id=='bChooseColor'){//black piece     
        ev.target.classList.add('highlightedPiece');
        document.getElementById('wChooseColor').classList.remove('highlightedPiece');
    }
    else{//white piece
        ev.target.classList.add('highlightedPiece');
        document.getElementById('bChooseColor').classList.remove('highlightedPiece');
    }
}



function submitStep(ev){
    if(ev.target.value=='Next'){//goes to page 2
        ev.preventDefault(); 

        let inputs=document.querySelectorAll('.formPanel .page1 input');
        let isError=false;
        let curValue;

        //name
        curValue=inputs[0].value;
        if(curValue==""){
            inputs[0].setCustomValidity('You need to fill out this field.');
            isError=true;
        }
        else//removes red frame
            inputs[0].setCustomValidity('');

        //email
        curValue=inputs[1].value;
        const atInd=curValue.indexOf("@");
        const dotInd=curValue.lastIndexOf(".");
        if(curValue!="" && (atInd<1 || dotInd<atInd+2)){
            inputs[1].setCustomValidity('You need to enter email address.');
            isError=true;
        }
        else//removes red frame
            inputs[1].setCustomValidity('');

        //password
        curValue=inputs[2].value;
        if(curValue!="" && (curValue.length<8 || curValue.length>15)){
            inputs[2].setCustomValidity(`You need to use at least 8 symbols (now you use ${curValue.length} symbols).`);
            isError=true;
        }
        else//removes red frame
            inputs[2].setCustomValidity('');

        //age
        curValue=inputs[3].value;
        let pattern=/^[0123456789]+$/;
        if(curValue!="" && (!curValue.match(pattern) || curValue>=200)){
            inputs[3].setCustomValidity('You need to enter a number.');
            isError=true;
        }
        else//removes red frame
            inputs[3].setCustomValidity('');

        //phone number
        curValue=inputs[inputs.length-1].value;
        pattern=/^\+[0123456789]{10,}$/;
        if(curValue!="" && !curValue.match(pattern)){
            inputs[inputs.length-1].setCustomValidity('You need to use required format (i.e. +381234567890).');
            isError=true;
        }
        else//removes red frame
            inputs[inputs.length-1].setCustomValidity('');


        if(!isError){
            document.querySelector('.formPanel .page1').style='display:none';
            document.querySelector('.formPanel .page2').style='display:initial';
            ev.target.value='Submit'; 
        }
    }
    else{//submits the form
        document.getElementById('startedGame').value=!arcade;//hidden field

        // let address=location.href;//to get URL and then it can be processed as String
    }
}
