import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import chaiBignumber from "chai-bignumber";

import chaiWeb3 from "./test/helpers/chaiWeb3";

chai
  .use(chaiAsPromised)
  .use(chaiBignumber(web3.BigNumber))
  .use(chaiWeb3);
