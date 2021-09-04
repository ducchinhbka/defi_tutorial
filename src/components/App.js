import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount()
  {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3()
  {
    if(window.ethereum)
    {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3)
    {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else
    {
      window.alert('You do not have meta mask installed.')
    }
  }

  async loadBlockchainData()
  {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]})

    // Load Dai Token
    const networkId = await web3.eth.net.getId()
    const daiTokenData = DaiToken.networks[networkId]

    if(daiTokenData){

      // create js version of the contract
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({daiToken})
    
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call();
      this.setState({daiTokenBalance: daiTokenBalance.toString()})
      console.log({daiTokenBalance})

    } else {
      window.alert('Dai Token contract not deployed to this network');
    }

    // Load DappToken
    
    const dappTokenData = DappToken.networks[networkId]

    if(dappTokenData){

      // create js version of the contract
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({dappToken})
    
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call();
      this.setState({dappTokenBalance: dappTokenBalance.toString()})
      

    } else {
      window.alert('Dapp Token contract not deployed to this network');
    }

    // Load Token Farm
    
    const tokenFarmData = TokenFarm.networks[networkId]

    if(dappTokenData){

      // create js version of the contract
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({tokenFarm})
    
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call();
      this.setState({stakingBalance: stakingBalance.toString()})
      
    } else {
      window.alert('Dapp Token contract not deployed to this network');
    }

    this.setState({loading: false})

  }

  stakeTokens = (amount) => {

    this.setState({loading: true})
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({from: this.state.account}).on('transactionHash', (hash) => {

      this.state.tokenFarm.methods.stakeTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) => {

        this.setState({loading: false})
     
      })

    })
  }

  unstakeTokens = () => {

    this.setState({loading: true})
    
    this.state.tokenFarm.methods.unstakeTokens().send({from: this.state.account}).on('transactionHash', (hash)=> {

      this.setState({loading: false})
    
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    
    let content
      if(this.state.loading){
        content = <p id='loader' className="text-center">Loading..</p>
      }else {
        content = 
        <Main 
        daiTokenBalance = {this.state.daiTokenBalance}
        dappTokenBalance = {this.state.dappTokenBalance}
        stakingBalance= {this.state.stakingBalance}
        stakeTokens = {this.stakeTokens}
        unstakeTokens = {this.unstakeTokens}
        />
      }

    return (

      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

               { content }

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
