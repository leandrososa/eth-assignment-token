import React, { Component } from 'react';
import 'bulma/css/bulma.min.css';
import MyToken from './contracts/MyToken.json';
import MyTokenSale from './contracts/MyTokenSale.json';
import KycContract from './contracts/KycContract.json';
import {
  Box,
  Button,
  Columns,
  Container,
  Form,
  Heading,
  Block,
  Image,
} from 'react-bulma-components';
import getWeb3 from './getWeb3';
import Icon from '@mdi/react';
import { mdiCircleMultiple, mdiPlus } from '@mdi/js';

import './App.css';

class App extends Component {
  state = {
    loaded: false,
    kycAddress: '',
    tokenSaleAddress: null,
    userTokens: 0,
    totalSupply: 0,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] &&
          MyToken.networks[this.networkId].address
      );

      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] &&
          MyTokenSale.networks[this.networkId].address
      );
      this.kycInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] &&
          KycContract.networks[this.networkId].address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.setState(
        {
          loaded: true,
          tokenSaleAddress: MyTokenSale.networks[this.networkId].address,
        },
        this.updateUserTokens
      );
      this.getTotalSupply();
      //let totalSupply = await this.tokenInstance.methods.totalSupply();
      //this.setState({ totalSupply: totalSupply });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  updateUserTokens = async () => {
    let userTokens = await this.tokenInstance.methods
      .balanceOf(this.accounts[0])
      .call();
    this.setState({ userTokens: userTokens });
  };

  listenToTokenTransfer = () => {
    this.tokenInstance.events
      .Transfer({ to: this.accounts[0] })
      .on('data', this.updateUserTokens);
  };

  handleBuyTokens = async () => {
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({
      from: this.accounts[0],
      value: this.web3.utils.toWei('1', 'wei'),
    });
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  };

  handleKycWhitelisting = async () => {
    await this.kycInstance.methods
      .setKycCompleted(this.state.kycAddress)
      .send({ from: this.accounts[0] });
    alert('KYC for ' + this.state.kycAddress + ' is completed');
  };

  getTotalSupply = async () => {
    let totalSupply = await this.tokenInstance.methods.totalSupply().call();
    this.setState({ totalSupply: totalSupply });
  };

  render() {
    if (!this.state.loaded) {
      return (
        <Container textAlign='center'>
          <div className='m-4'>
            <Image
              display='inline-block'
              rounded
              size={64}
              src='img/metamask.svg'
            />
            <Heading>Connecting with Metamask...</Heading>
            <p>Make sure to select Ropsten Test Network</p>
          </div>
        </Container>
      );
    }
    return (
      <Container>
        <div className='App m-4 has-text-centered'>
          <Box display='inline-block' className='main-box'>
            <Heading
              textColor='success'
              subtitle
              className='text-wide uppercase'
            >
              Total token supply: <b>{this.state.totalSupply}</b>
            </Heading>
            <Block textAlign='center'>
              <Image
                display='inline-block'
                rounded
                size={64}
                src='img/onion.svg'
              />
            </Block>
            <Heading marginless>GoldenOnion Mintable Token Sale</Heading>
            <p className='is-size-4 mb-4'>Get your Onion today!</p>
            <Columns breakpoint='tablet'>
              <Columns.Column>
                <div className='subheader-line'>
                  <h2>KYC Whitelisting</h2>
                </div>
                <p className='mb-6'>
                  In order to any account to mint <b>ONION</b>, it must be
                  whitelisted beforehand.
                </p>
                <Form.Field align='center' kind='group'>
                  <Form.Control fullwidth>
                    <Form.Input
                      name='kycAddress'
                      value={this.state.kycAddress}
                      onChange={this.handleInputChange}
                      placeholder='Address to allow'
                      type='text'
                    ></Form.Input>
                  </Form.Control>
                  <Form.Control>
                    <Button
                      color='success'
                      onClick={this.handleKycWhitelisting}
                    >
                      <Icon path={mdiPlus} size={1}></Icon>&nbsp;Add to
                      Whitelist
                    </Button>
                  </Form.Control>
                </Form.Field>
              </Columns.Column>
              <Columns.Column>
                <div className='subheader-line'>
                  <h2>Buy Tokens</h2>
                </div>
                <p className='is-size-4'>You currently have </p>
                <span className='is-size-2 has-text-success has-text-weight-bold'>
                  {this.state.userTokens}
                </span>
                <p className='is-size-4'>
                  <b>ONION</b> Tokens
                </p>
                <p className='has-text-grey'>
                  If you want to buy tokens, send Wei to this address:
                  <br />
                  <b>{this.state.tokenSaleAddress}</b>
                </p>
                <h4 className='is-size-4 my-4'>OR</h4>
                <Button color='success' onClick={this.handleBuyTokens}>
                  <Icon path={mdiCircleMultiple} size={1}></Icon>&nbsp; Buy more
                  tokens
                </Button>
              </Columns.Column>
            </Columns>
          </Box>
          <p>Educational dApp deployed in Test Network.</p>
          <p>
            Modified by{' '}
            <a href='https://github.com/leandrososa' target='_blank'>
              leandrososa
            </a>
            . Original assignment for the{' '}
            <a
              href='https://www.udemy.com/course/blockchain-developer/'
              target='_blank'
            >
              Ethereum Solidity Developer Bootcamp
            </a>
            .
          </p>
        </div>
      </Container>
    );
  }
}

export default App;
