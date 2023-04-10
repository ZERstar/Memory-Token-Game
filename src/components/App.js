import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'
import logo from '../logo.jpg'

const CARD_ARRAY = [
  {
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'ice-cream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  },
  {
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'ice-cream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  }
]

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    this.setState({ cardArray: CARD_ARRAY.sort(() => 0.5 - Math.random()) })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    // Load smart contract
    const networkId = await web3.eth.net.getId()
    const networkData = MemoryToken.networks[networkId]
    if (networkData) {
      const abi = MemoryToken.abi
      const address = networkData.address
      const token = new web3.eth.Contract(abi, address)
      this.setState({ token })
      const totalSupply = await token.methods.totalSupply().call()
      this.setState({ totalSupply })
      // Load Tokens
      let balanceOf = await token.methods.balanceOf(accounts[0]).call()
      for (let i = 0; i < balanceOf; i++) {
        let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call()
        let tokenURI = await token.methods.tokenURI(id).call()
        this.setState({
          tokenURIs: [...this.state.tokenURIs, tokenURI]
        })
      }
    } else {
      alert('Smart contract not deployed to detected network.')
    }
  }

  chooseImage = (cardId) => {
    cardId = cardId.toString()
    if (this.state.cardsWon.includes(cardId)) {
      return window.location.origin + '/images/white.png'
    }
    else if (this.state.cardsChosenId.includes(cardId)) {
      return CARD_ARRAY[cardId].img
    } else {
      return window.location.origin + '/images/tile.jpg'
    }
  }

  flipCard = async (cardId) => {
    let alreadyChosen = this.state.cardsChosen.length

    this.setState({
      cardsChosen: [...this.state.cardsChosen, this.state.cardArray[cardId].name],
      cardsChosenId: [...this.state.cardsChosenId, cardId]
    })

    if (alreadyChosen === 1) {
      setTimeout(this.checkForMatch, 100)
    }
  }


  checkForMatch = async () => {
    const optionOneId = this.state.cardsChosenId[0]
    const optionTwoId = this.state.cardsChosenId[1]

    if (optionOneId == optionTwoId) {
      alert('You have clicked the same image!')
    } else if (this.state.cardsChosen[0] === this.state.cardsChosen[1]) {
      alert('You found a match')
      this.state.token.methods.mint(
        this.state.account,
        window.location.origin + CARD_ARRAY[optionOneId].img.toString()
      )
        .send({ from: this.state.account })
        .on('transactionHash', (hash) => {
          this.setState({
            cardsWon: [...this.state.cardsWon, optionOneId, optionTwoId],
            tokenURIs: [...this.state.tokenURIs, CARD_ARRAY[optionOneId].img]
          })
        })
    } else {
      alert('Sorry, try again')
    }
    this.setState({
      cardsChosen: [],
      cardsChosenId: []
    })
    if (this.state.cardsWon.length === CARD_ARRAY.length) {
      alert('Congratulations! You found them all!')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      cardArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: []
    }
  }

  render() {
    return (
      <div>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          <div class="container">
            <a class="navbar-brand me-2" href="https://mdbgo.com/">
              <img
                class="m-2"
                src={logo}
                height="35"
                alt="MDB Logo"
                loading="lazy"
              />
              Memory Token
            </a>
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" href="#">{this.state.account}</a>
              </li>
            </ul>

          </div>
        </nav>
        <main role="main" className="main_container">

          <h1 className="">Let's Play!</h1>

          <div className="card_container" >

            {this.state.cardArray.map((card, key) => {
              return (
                <img
                  key={key}
                  src={this.chooseImage(key)}
                  data-id={key}
                  onClick={(event) => {
                    let cardId = event.target.getAttribute('data-id')
                    if (!this.state.cardsWon.includes(cardId.toString())) {
                      this.flipCard(cardId)
                    }
                  }}
                />
              )
            })}


          </div>

          <div className='result_container'>

            <h5>Tokens Collected:<span id="result">&nbsp;{this.state.tokenURIs.length}</span></h5>

            <div className="result_img-container" >

              {this.state.tokenURIs.map((tokenURI, key) => {
                return (
                  <img
                    key={key}
                    src={tokenURI}
                  />
                )
              })}

            </div>

          </div>

        </main>
      </div >
    );
  }
}

export default App;
