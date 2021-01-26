<template>
    <div class="block" @dragover.stop="dragover" @dragleave.stop="dragleave" @drop.stop="drop" @dragover.prevent :style="{position, bottom, right, width, height, backgroundColor}">
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
            drop: function(event){
                this.icon = 'mdi-delete';
                this.$emit('drop', event, this);
            },
            dragover(e, c){
                this.icon = 'mdi-delete-empty';
            },
            dragleave(e, c){
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