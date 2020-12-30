<template>
    <div class="block" @mouseout.stop="mouseOut" @mouseover.stop="mouseOver" @mouseup.stop="mouseUp" @touchend.stop="mouseUp" :style="{position, bottom, right, width, height, backgroundColor}">
        <v-icon dark x-large>{{icon}}</v-icon>
    </div>
</template>

<script>
    export default {
        props: {
            backgroundColor: {
                type: String,
                default: "#1658c7",
            },
        },
        data(){
            return ({
                bottom: 'auto',
                right: 'auto',
                width: 'auto',
                height: 80,
                position: "static",
                icon: 'mdi-delete',
            })
        },
        methods: {
            mouseUp: function(event){
                this.$emit('mouseup', event, this);
            },
            mouseOver(e, c){
                this.icon = 'mdi-delete-empty';
            },
            mouseOut(e, c){
                this.icon = 'mdi-delete';
            },
        },
    }
</script>

<style scoped>
    .block{
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>