import { accountsOnNetwork, defaultNetwork } from "../../../shared/networks"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { getAccounts, getLastSelectedAccount } from "../../services/messaging"
import { Account } from "../accounts/Account"
import { setDefaultAccountNames } from "../accounts/accountMetadata.state"
import { useAccount } from "../accounts/accounts.state"

interface RecoveryOptions {
  networkId?: string
  showAccountList?: boolean
}

export const recover = async ({
  networkId,
  showAccountList,
}: RecoveryOptions = {}) => {
  try {
    const lastSelectedAccount = await getLastSelectedAccount()
    networkId ||= lastSelectedAccount
      ? lastSelectedAccount?.network.id
      : defaultNetwork.id

    const walletAccounts = accountsOnNetwork(await getAccounts(), networkId)

    const selectedAccount = walletAccounts.find(
      ({ address }) => address === lastSelectedAccount?.address,
    )?.address

    const accounts = walletAccounts
      .map(
        ({ address, network, signer }) => new Account(address, network, signer),
      )
      .reduce((acc, account) => ({ ...acc, [account.address]: account }), {})

    setDefaultAccountNames(accounts)
    useAccount.setState({ accounts, selectedAccount })
    useAppState.setState({ switcherNetworkId: networkId })

    if (showAccountList || !selectedAccount) {
      return routes.accounts()
    }
    return routes.accountTokens()
  } catch (e: any) {
    console.error("Recovery error:", e)
    useAppState.setState({ error: `${e}` })
    return routes.error()
  }
}