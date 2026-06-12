<template>
    <div></div>
</template>


<script>
    export default {
        name: 'provision-indication',
        props: {
            divider: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            logo: {
                type: Boolean,
                default() {
                    return false;
                }
            },
        },
        methods: {
            provision() {
                this.$router.push({path: '/provision'});
            },
        },
        computed: {
            isForeign(){
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
        }
    }
</script>

<style>
.footer-btn {
    cursor: pointer;
    font-size:13px;
    margin-top:3px;
    font-weight: 500;
}
.footer-is-mobile {
    display: none;
}

@media only screen and (max-width:1080px) {
    .footer-is-mobile {
        display: block;
    }
    .footer-is-web {
        display: none;
    }   
}
</style>