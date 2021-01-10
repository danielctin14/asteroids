const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

//setarea canvasului pe dimensiunea browserului
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

//legatura intre elementele html
const livesSpan = document.querySelector('#livesSpan')
const rocketsSpan = document.querySelector('#rocketsSpan')
const scoreSpan = document.querySelector('#scoreSpan')
const startButton = document.querySelector('#startButton')
const popup = document.querySelector("#popup")
const scoreFinal = document.querySelector("#scoreFinal")
let playerName = document.getElementById("playerName").value

const isStorage = 'undefined' !== typeof localStorage


class Highscore {
    constructor(name, score) {
        this.name = name
        this.score = score
    }
}

//sortarea custom dupa elementul score al clasei Highscore, descrescatoare
function customSort(a, b) {
    if (a.score === b.score) {
        return 0;
    }
    else {
        return (a.score > b.score) ? -1 : 1;
    }
}

let highscores = []

if (isStorage && localStorage.getItem('highscores')) {
    highscores = JSON.parse(localStorage.getItem('highscores'))
}
for (let index = 0; index < highscores.length; index++) {
    const nameString = "#player" + index + "Name"
    const scoreString = "#player" + index + "Score"
    document.querySelector(nameString).innerHTML = highscores[index].name
    document.querySelector(scoreString).innerHTML = highscores[index].score
}


let score = 0

class Player {
    constructor(xCenter, yCenter, angle, strokeColor, fillColor) {
        this.xCenter = xCenter
        this.yCenter = yCenter
        this.angle = angle
        this.strokeColor = strokeColor
        this.fillColor = fillColor
    }

    calculateXA() {
        return 15 * Math.cos(this.angle * Math.PI / 180)
    }

    calculateYA() {
        return 15 * Math.sin(this.angle * Math.PI / 180)
    }

    draw() {
        var xA = this.calculateXA()
        var yA = this.calculateYA()

        var angleB = this.angle + 180 + 67.5 / 2
        var angleC = this.angle + 180 - 67.5 / 2

        var bRadians = angleB * Math.PI / 180
        var cRadians = angleC * Math.PI / 180

        var xB = Math.sqrt(325) * Math.cos(bRadians)
        var yB = Math.sqrt(325) * Math.sin(bRadians)

        var xC = Math.sqrt(325) * Math.cos(cRadians)
        var yC = Math.sqrt(325) * Math.sin(cRadians)

        context.beginPath()
        context.moveTo(this.xCenter + xA, this.yCenter + yA)
        context.lineTo(this.xCenter + xB, this.yCenter + yB)
        context.lineTo(this.xCenter + xC, this.yCenter + yC)

        context.closePath()

        context.lineWidth = 2
        context.strokeStyle = this.strokeColor
        context.stroke()

        context.fillStyle = this.fillColor
        context.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y

    }
}

class Asteroid {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.hitpoints = radius / 10
    }

    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()

        context.beginPath()
        context.fillStyle = "red"
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.font = "bold " + this.radius + "px Arial"
        context.fillText(this.hitpoints, this.x, this.y)
        context.fill()
    }

    resurface() {
        if (this.x + this.radius < 0) {
            this.x = canvas.width + this.radius
        }

        if (this.x - this.radius > canvas.width) {
            this.x = -this.radius
        }

        if (this.y + this.radius < 0) {
            this.y = canvas.height + this.radius
        }

        if (this.y - this.radius > canvas.height) {
            this.y = -this.radius
        }
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.resurface()
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 270, 'yellow', 'red')
let projectiles = []
let asteroids = []
let asteroidNumber = 10
let playerLives = 3
let livesAwarded = 0

function start() {
    playerName = document.getElementById("playerName").value
    score = 0
    scoreSpan.innerHTML = 0
    rocketsSpan.innerHTML = 3
    livesSpan.innerHTML = 3

    player = new Player(x, y, 270, 'yellow', 'red')
    projectiles = []
    asteroids = []
    asteroidNumber = 10
    projectileNumber = 0
    playerLives = 3
    livesAwarded = 0
}

function restart() {
    playerLives--
    livesSpan.innerHTML = playerLives
    player = new Player(x, y, 270, 'yellow', 'red')
    asteroids = []
    spawnAsteroids()
}

function spawnAsteroids() {
    for (let index = 0; index < asteroidNumber; index++) {
        let radius
        let color
        let random = Math.random()

        if (random < 0.15) {
            radius = 10
            color = "#aaaaaa"
        } else if (random < 0.5) {
            radius = 20
            color = "#707070"
        } else if (random < 0.85) {
            radius = 30
            color = "#383838"
        } else {
            radius = 40
            color = "#000000"
        }



        let x = Math.random() * canvas.width
        let y = Math.random() * canvas.height
        let safeSpace = 10

        if (x > canvas.width / 2 - safeSpace && x < canvas.width + safeSpace) {
            if (Math.random() < 0.5) {
                x = 0
            } else {
                x = canvas.width
            }

        }
        if (y > canvas.height / 2 - safeSpace && y < canvas.height + safeSpace) {
            if (Math.random() < 0.5) {
                y = 0
            } else {
                y = canvas.height
            }
        }

        const angle = Math.random() * Math.PI * 2;
        let randomvelocity = Math.random()
        if (randomvelocity < 0.35) {
            randomvelocity = 0.35
        }

        const velocity = {
            x: Math.cos(angle) * randomvelocity * (2.5 - 0.05 * radius),
            y: Math.sin(angle) * randomvelocity * (2.5 - 0.05 * radius),
        }
        asteroids.push(new Asteroid(x, y, radius, color, velocity))
    }
}

function coliziuneAsteroizi(asteroid1, asteroid2, vel1, vel2, dir2, dir2, directieC, radius1, radius2) {

    const masa1 = radius1 - radius2;
    const masa2 = radius1 + radius2;
    const vector1 = vel1 * Math.sin(dir2 - directieC);

    const cos1 = Math.cos(directieC);
    const sin1 = Math.sin(directieC);
    var lin1 = vel1 * Math.cos(dir2 - directieC);
    var lin2 = vel2 * Math.cos(dir2 - directieC);
    const cos2 = Math.cos(directieC + Math.PI / 2)
    const sin2 = Math.sin(directieC + Math.PI / 2)

    var x = (lin1 * masa1 + 2 * radius2 * lin2) / masa2;
    asteroid1.velocity.x = x * cos1 + vector1 * cos2;
    asteroid1.velocity.y = x * sin1 + vector1 * sin2;
    directieC += Math.PI;
    const vector2 = vel2 * Math.sin(dir2 - directieC);
    lin1 = vel1 * Math.cos(dir2 - directieC);
    lin2 = vel2 * Math.cos(dir2 - directieC);
    x = (lin2 * -masa1 + 2 * radius1 * lin1) / masa2;
    asteroid2.velocity.x = x * -cos1 + vector2 * -cos2;
    asteroid2.velocity.y = x * -sin1 + vector2 * -sin2;
}

let animationId


function animate() {
    animationId = requestAnimationFrame(animate)
    context.fillStyle = "#000056"
    context.fillRect(0, 0, canvas.width, canvas.height)
    executeActions()
    player.draw()
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update()

        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            projectiles.splice(projectileIndex, 1)
            projectileNumber--
            rocketsSpan.innerHTML = 3 - projectileNumber
        }
    })

    asteroids.forEach((asteroid, asteroidIndex) => {

        for (let index = 0; index < asteroids.length; index++) {
            if (asteroidIndex < index) {
                const dx = asteroids[index].x - asteroid.x
                const dy = asteroids[index].y - asteroid.y
                const distance = Math.hypot(dx, dy)
                if (distance <= asteroid.radius + asteroids[index].radius) {

                    const nx = dx / distance
                    const ny = dy / distance

                    const touch = (distance * (asteroid.radius / (asteroid.radius + asteroids[index].radius)))
                    const contactX = asteroid.x + nx * touch
                    const contactY = asteroid.y + ny * touch

                    asteroid.x = contactX - nx * asteroid.radius
                    asteroid.y = contactY - ny * asteroid.radius

                    asteroids[index].x = contactX + nx * asteroids[index].radius
                    asteroids[index].y = contactY + ny * asteroids[index].radius

                    const v1 = Math.hypot(asteroid.velocity.x, asteroid.velocity.y)
                    const v2 = Math.hypot(asteroids[index].velocity.x, asteroids[index].velocity.y)

                    const dir1 = Math.atan2(asteroid.velocity.x, asteroid.velocity.y)
                    const dir2 = Math.atan2(asteroids[index].velocity.x, asteroids[index].velocity.y)

                    const directContact = Math.atan2(ny, nx)

                    coliziuneAsteroizi(asteroid, asteroids[index], v1, v2, dir1, dir2, directContact, asteroid.radius, asteroids[index].radius)

                    asteroid.x = asteroid.x + asteroid.velocity.x
                    asteroid.y = asteroid.y + asteroid.velocity.y
                    asteroids[index].x = asteroids[index].x + asteroids[index].velocity.x
                    asteroids[index].y = asteroids[index].y + asteroids[index].velocity.y

                }
            }
        }
    })

    asteroids.forEach((asteroid, asteroidIndex) => {
        asteroid.update()

        const distance = Math.hypot(player.xCenter - asteroid.x, player.yCenter - asteroid.y)
        if (distance - asteroid.radius < 1) {
            if (playerLives > 0) {
                restart()
            } else {
                //oprirea animatiei la ultimul frame
                cancelAnimationFrame(animationId)

                if (highscores.length < 5) {
                    highscores.push(new Highscore(playerName, score))
                    highscores.sort(customSort)
                    isStorage && localStorage.setItem('highscores', JSON.stringify(highscores))
                } else if (score > highscores[4].score) {
                    highscores.splice(4, 1)
                    highscores.push(new Highscore(playerName, score))
                    highscores.sort(customSort)
                    isStorage && localStorage.setItem('highscores', JSON.stringify(highscores))
                }
                for (let index = 0; index < highscores.length; index++) {
                    const nameString = "#player" + index + "Name"
                    const scoreString = "#player" + index + "Score"
                    document.querySelector(nameString).innerHTML = highscores[index].name
                    document.querySelector(scoreString).innerHTML = highscores[index].score
                }


                scoreFinal.innerHTML = score
                popup.style.display = 'initial'
            }
        }


        projectiles.forEach((projectile, projectileIndex) => {
            const distance = Math.hypot(projectile.x - asteroid.x, projectile.y - asteroid.y)
            if (distance - asteroid.radius - projectile.radius < 1) {
                setTimeout(() => {
                    projectiles.splice(projectileIndex, 1)
                    projectileNumber--
                    rocketsSpan.innerHTML = 3 - projectileNumber
                    score = score + 50
                    scoreSpan.innerHTML = score
                    asteroid.hitpoints--;
                    if (asteroid.hitpoints < 1) {
                        score = score + asteroid.radius * 10
                        if (parseInt(score / 5000) > livesAwarded) {
                            playerLives++
                            livesAwarded++
                            livesSpan.innerHTML = playerLives
                        }
                        scoreSpan.innerHTML = score
                        asteroids.splice(asteroidIndex, 1)
                    }
                }, 0)
            }
        })
    })


    setTimeout(() => {
        if (asteroids.length < 1) {
            asteroidNumber++
            spawnAsteroids()
        }
    }, 500)


}

var rotationvelocity = 2;

//mai jos este comentat un alt tip de movement relativ cu axele x y ale Playerului nu ale broswerului

function moveLeft() {
    player.xCenter = player.xCenter - 1//player.xCenter + Math.cos((player.angle + 270) * Math.PI / 180)
    //player.yCenter = player.yCenter + Math.sin((player.angle + 270) * Math.PI / 180)
}

function moveRight() {
    player.xCenter = player.xCenter + 1//player.xCenter + Math.cos((player.angle + 90) * Math.PI / 180)
    //player.yCenter = player.yCenter + Math.sin((player.angle + 90) * Math.PI / 180)
}

function moveUp() {
    //player.xCenter = player.xCenter + Math.cos(player.angle * Math.PI / 180)
    player.yCenter = player.yCenter - 1//player.yCenter + Math.sin(player.angle * Math.PI / 180)
}

function moveDown() {
    //player.xCenter = player.xCenter + Math.cos((player.angle + 180) * Math.PI / 180)
    player.yCenter = player.yCenter + 1//player.yCenter + Math.sin((player.angle + 180) * Math.PI / 180)
}

function rotateLeft() {
    player.angle = player.angle - rotationvelocity;
}

function rotateRight() {
    player.angle = player.angle + rotationvelocity;
}

let available = true
let projectileNumber = 0;

function shootProjectile() {
    if (projectileNumber < 3) {
        if (available) {
            projectileNumber++
            rocketsSpan.innerHTML = 3 - projectileNumber
            const projectilevelocity = 2;
            const velocity = {
                x: projectilevelocity * Math.cos(player.angle * Math.PI / 180),
                y: projectilevelocity * Math.sin(player.angle * Math.PI / 180)
            }

            projectiles.push(new Projectile(player.xCenter + player.calculateXA(),
                player.yCenter + player.calculateYA(),
                3,
                'white',
                velocity
            ))
            available = false

            setTimeout(() => {
                available = true;
            }, 100)
        }
    }
}


//Order is: Z - X - C - Left - Up - Right - Down
const controller = {
    KeyZ: { pressed: false, func: rotateLeft },
    KeyX: { pressed: false, func: rotateRight },
    KeyC: { pressed: false, func: shootProjectile },
    ArrowLeft: { pressed: false, func: moveLeft },
    ArrowUp: { pressed: false, func: moveUp },
    ArrowRight: { pressed: false, func: moveRight },
    ArrowDown: { pressed: false, func: moveDown },
}

addEventListener('keydown', event => {
    if (controller[event.code]) {
        controller[event.code].pressed = true;
    }
})

addEventListener('keyup', event => {
    if (controller[event.code]) {
        controller[event.code].pressed = false;
    }
})

//functia necesara pentru inregistrarea apasarilor multiple de la tastatura
//parcurge arrayul custom de taste si verifica daca sunt apasate iar apoi executa codul specific
const executeActions = () => {
    Object.keys(controller).forEach(key => {
        controller[key].pressed && controller[key].func()
    })
}

startButton.addEventListener('click', () => {
    start()
    spawnAsteroids()
    animate()
    popup.style.display = 'none'
})



