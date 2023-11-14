<template>

    <div>
        <slot>
            <v-btn @click="gimmick">상금</v-btn>
        </slot>
    </div>
    
</template>

<script>
export default {

    props:{
        value: Number
    },

    data: ()=>{
        var me = this;

        var coin = new Image();
        coin.src = 'http://i.imgur.com/5ZW2MT3.png'
        // 440 wide, 40 high, 10 states

        return {
            canvas: null,
            coins: [],
            stopped: true,
            coin: coin,
            ctx: null,
            focused: false,
            budget: 50,
            amount: 0,
            dropped: 0
        }

    },

    mounted() {
        var element = document.querySelector('body');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.classList.add('gimmick');
        this.canvas.id = 'gimmick'

        element.appendChild(this.canvas)
        this.focused = true;
        this.drawloop();
    },

    watch:{

        value(value){
            this.amount = value;
            this.dropped = this.amount;
        }

    },

    methods: {
        gimmick() {

            var exists = document.getElementById('gimmick')
            if (exists) {
                //this.amount += this.budget;

                this.amount = parseInt(prompt("상금 예산을 입력하세요"));

                return false;
            }
        },

        drop(amount){
            this.amount = amount;
            this.dropped = amount;
        },

        drawloop() {
            if (this.focused) {
                requestAnimationFrame(this.drawloop);
            }
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            if (Math.random() < .3 && this.amount > 0) {
                this.coins.push({
                    x: Math.random() * this.canvas.width | 0,
                    y: -50,
                    dy: 3,
                    s: 0.5 + Math.random(),
                    state: Math.random() * 10 | 0
                })
                this.amount --;

            }
            var i = this.coins.length
            while (i--) {

                var x = this.coins[i].x
                var y = this.coins[i].y
                var s = this.coins[i].s
                var state = this.coins[i].state
                this.coins[i].state = (state > 9) ? 0 : state + 0.1
                this.coins[i].dy += 0.3
                this.coins[i].y += this.coins[i].dy

                this.ctx.drawImage(this.coin, 44 * Math.floor(state), 0, 44, 40, x, y, 44 * s, 40 * s)

                if (y > this.canvas.height) {
                    this.coins.splice(i, 1);
                    this.dropped --;
                    this.$emit('drop', this.dropped);
                    if(this.dropped==0)
                        this.$emit('allDrop', this.dropped);
                    
                }
            }
        }
    }

}


</script>

<style lang="css" rel="stylesheet/css">


    .gimmick {
        display:block;
        pointer-events:none;
        position: absolute;
        top:0;
        left:0;
        z-index: 99999999
    }
</style>