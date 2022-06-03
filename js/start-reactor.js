memoryButton = {

    computerCombination: [],
    playerCombination: [],
    computerCombinationPosition: 1,
    combinationMaxPosition: 5,
    memoryMaxCombination: 9,

    audio: {
        start: 'start.mp3',
        fail: 'fail.mp3',
        complete: 'complete.mp3',
        combinations: ['0.mp3', '1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '6.mp3', '7.mp3', '8.mp3'],
        
        loadAudio(filename) {

            const file = `./audio/${filename}?cb=${new Date().getTime()}`
            const audio = new Audio(file)
            audio.load()
            return audio

        },

        loadAudios() {

            if (typeof(memoryButton.audio.start) == "object") return

            memoryButton.audio.start = memoryButton.audio.loadAudio(memoryButton.audio.start)
            memoryButton.audio.complete = memoryButton.audio.loadAudio(memoryButton.audio.complete)
            memoryButton.audio.fail = memoryButton.audio.loadAudio(memoryButton.audio.fail)
            memoryButton.audio.combinations = memoryButton.audio.combinations.map ( (audio) => memoryButton.audio.loadAudio(audio))

        }
        

    },
    interface: {

        memoryPanel: document.querySelector(".painelMemory"),
        computerLedPanel: document.querySelector(".computerLedPanel"),
        playerLedPanel: document.querySelector(".playerLedPanel"),
        playerMemory: document.querySelector(".playerMemory"),
        playerMemoryButtons: document.getElementsByClassName("player_memory"),

        turnLedOn(index, ledPanel) {
            ledPanel.children[index].classList.add("ledOn");
        },

        turnAllLedsOff() {
            
            const computerLedPanel = memoryButton.interface.computerLedPanel
            const playerLedPanel = memoryButton.interface.playerLedPanel

            for (var i = 0; i < computerLedPanel.children.length; i++) {
                computerLedPanel.children[i].classList.remove("ledOn");
                playerLedPanel.children[i].classList.remove("ledOn");
            }

        },

        async start() {
            return memoryButton.audio.start.play()
        },

        playItem(index, combinationPosition, location = 'computer') {
            
            const leds = (location == 'computer') ? memoryButton.interface.computerLedPanel : memoryButton.interface.playerLedPanel
            const memPanel = memoryButton.interface.memoryPanel.children[index]

            memPanel.classList.add("memoryActive")
            memoryButton.interface.turnLedOn(combinationPosition, leds)
            memoryButton.audio.combinations[index].play().then(() => {
                setTimeout(() => {
                    memPanel.classList.remove("memoryActive")
                }, 150)
            })
        },

        endGame(type = "fail") {
            
            const memPanel = memoryButton.interface.memoryPanel
            const ledPanel = memoryButton.interface.computerLedPanel
            const audio = (type == "complete") ? memoryButton.audio.complete : memoryButton.audio.fail
            const typeClasses = (type == "complete") ? ["playerMemoryComplete", "playerLedComplete"] : ["playerMemoryError", "playerLedError"]

            memoryButton.interface.disableButtons()
            memoryButton.interface.turnAllLedsOff()

            audio.play().then(() => {

                for (var i = 0; i < memPanel.children.length; i++) {
                    if (memPanel.children[i].tagName == "DIV")
                        memPanel.children[i].classList.add(typeClasses[0])
                }
                for (var i = 0; i < ledPanel.children.length; i++) {
                    if (ledPanel.children[i].tagName == "DIV")
                        ledPanel.children[i].classList.add(typeClasses[1])
                }
                setTimeout(() => {
                    for (var i = 0; i < memPanel.children.length; i++) {
                    if (memPanel.children[i].tagName == "DIV")
                        memPanel.children[i].classList.remove(typeClasses[0])
                    }
                    for (var i = 0; i < ledPanel.children.length; i++) {
                    if (ledPanel.children[i].tagName == "DIV")
                        ledPanel.children[i].classList.remove(typeClasses[1])
                    }
                }, 900);

            })

        },

        enableButtons() {

            const playerMemory = memoryButton.interface.playerMemory
            playerMemory.classList.add('playerActive')

            for (var i = 0; i < playerMemory.children.length; i++) {
                if (playerMemory.children[i].tagName == "DIV")
                    playerMemory.children[i].classList.add("playerMemoryActive")
            }

        },

        disableButtons() { 

            const playerMemory = memoryButton.interface.playerMemory
            playerMemory.classList.remove('playerActive')

            for (var i = 0; i < playerMemory.children.length; i++) {
            if (playerMemory.children[i].tagName == "DIV")
                playerMemory.children[i].classList.remove("playerMemoryActive");
            }

        },
        

    },

    async load() {
        return new Promise(resolve => {
            console.log("Loading Game...")
            memoryButton.audio.loadAudios()

            const playerMemory  = memoryButton.interface.playerMemory
            const memory = memoryButton.interface.playerMemoryButtons
            
            Array.prototype.forEach.call(memory, (element) => {

                element.addEventListener("click", () => {
                if (playerMemory.classList.contains("playerActive")) {
                    memoryButton.play(parseInt(element.dataset.memory))
                    console.log("O valor do elemento clicado é: " + element.dataset.memory)

                    element.style.animation = "playermemoryClick .4s"
                    setTimeout(() => element.style.animation = "", 400)
                }
                })  

            })
        })


     },
    start() {

        memoryButton.computerCombination = memoryButton.createCombination()
        memoryButton.computerCombinationPosition = 1
        memoryButton.playerCombination = []
        memoryButton.interface.start().then(() => {
            setTimeout(() => {
                memoryButton.playCombination()
            }, 500)
        })

    },
    
    createCombination() {

        let newCombination = []
        for (let n = 0; n < memoryButton.combinationMaxPosition; n++){
            const position = Math.floor((Math.random() * memoryButton.memoryMaxCombination) + 1)
            newCombination.push(position-1)
        }
        return newCombination

    },

    play(index) {

        memoryButton.interface.playItem(index, memoryButton.playerCombination.length, 'player')
        memoryButton.playerCombination.push(index)

        if (memoryButton.isTheRightCombination(memoryButton.playerCombination.length)) {
            
            if (memoryButton.playerCombination.length == memoryButton.combinationMaxPosition) {
                memoryButton.interface.endGame("complete")
                setTimeout(() => {
                    memoryButton.start()
                }, 1200)
                return
            }

            if (memoryButton.playerCombination.length == memoryButton.computerCombinationPosition) {
                memoryButton.computerCombinationPosition++
                setTimeout(() => {
                        memoryButton.playCombination()
                }, 1200)
                return
            }

        } else {

            memoryButton.interface.endGame("fail")
            document.getElementById("title").textContent = "Você é o impostor"
            setTimeout(() => {
                document.getElementById("title").textContent = "START REACTOR"
                memoryButton.start()
            }, 1400)
            return
        }
    },

    playCombination() {

        memoryButton.playerCombination = []
        memoryButton.interface.disableButtons()
        memoryButton.interface.turnAllLedsOff()

        for (let i = 0; i <= memoryButton.computerCombinationPosition - 1; i++){

            setTimeout(() => {
                memoryButton.interface.playItem(memoryButton.computerCombination[i], i)
            }, 400 * (i+1))
        }

        setTimeout(() => {
            memoryButton.interface.turnAllLedsOff()
            memoryButton.interface.enableButtons()
        }, 600 * memoryButton.computerCombinationPosition)

     },
    
    isTheRightCombination(position) {
        
        let computerCombination = memoryButton.computerCombination.slice(0, position)
        return ( computerCombination.toString() == memoryButton.playerCombination.toString())

    },

}