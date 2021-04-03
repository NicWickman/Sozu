const { MerkleTree } = require('merkletreejs')
const keccak = require('crypto-js/sha3')

const cids = [
    "QmZpRvB6io4sZaALCEyjdVesH3YggckdZ1kRpSrFDV5dFf",
    "QmebgH2vCcLDGQnwp48tSRirpLdGJs3rHtWdW3qyUMxakk",
    "QmUMWiebt7gsagt49t4R8GXzQVL2YJ67i5SwffQL1pRMJ9",
    "QmYgkjh2r3yYowh1QxMJRqUvdhjbgwt2MYWo3B1L76CC7Y",
    "QmZnP2bFKtHxydwdAZ4BHHv9qYNTPjxME6QwJDjsBA4atB",
    "QmRWoGvjsZqGfrXbtrzeBU1XESzrvMCJAWtkbHDGdNvbjU",
    "QmXjztPbBDdavBs9RcyDvo1Zxg3owUJsZfXuSb2GHhAJWL",
    "QmcKf7DPhy9wC9avsXVhd3XaNfkebF2BdLjGa9c4MUi6pw",
    "QmYWgtk8u9Ut9V8J5uFdpWTso6qWYeXzQCfdNPY5335Fcv",
    "Qmb9qNKXHKq4dzC1Yyo7rwV3fKS4BXKEDMJQwt8Fr2aPD2",
    "QmTtW4jsj8i8a85rGRVg3aWnbvhVNHYkZHLxx5LbpSK3AH",
    "QmSumHs1fu6okMGTMwBhq4DysPUFi5Bqueet8XZBsSzwZ2",
    "QmefAN431BtwxpkYYt8HkYMx6hkwGdV1MtfM7dTEYAMXMt",
    "QmYT3siC1bsAxgwWXdU6ATMkZzkXZLNye6f7bmdHviNZUv",
    "QmYqnYQ1Ue7xDVHw8okVhuHhhNjQ6epD15KF9EM2jSjh7c",
    "QmTGSZSxPyqmVYtr2b1S8pEd9neyZVobfHBKiRDDDkwjFF",
    "QmeF5dgoYhCGiM5aPVfNjva5Kw4zr9pQSd4gSoc9bKF4vi",
    "QmdiqFrzeCnFDdfyXAkhQNMBT9gEHzMb2waxcXwdNYTJYt",
    "QmZm7p47BCXff7SBVrk7T1CHZajvCQwtrTLkwnxcyrEikZ",
    "QmbkJWdBPXf3DbnjHivJfMbguGVRzPTfCJZmnF6wqTf9Cy",
    "QmSMfoizcm1LzA5tuymJ91zSTXrzErHdTjhxeAgk831YbH",
    "QmNSX8ga85DG1wQ9DgHwvXdQw57kLTnuPE981KmiJ7dRLS",
    "QmTjc3s9Y2mpFx1hbbLkvJyugXXHprbNpgcMrD54PnQRt2",
    "Qmany6TXXs9H4T7H6Hs2yEjqa8GSERxpcxLT6bub8tHGNx",
    "QmYZtwVQbbhrLNLwUC2DzJ5nMVg2UtK9qojtBT95dedXqZ",
    "QmVgQJ2BohMowDjYeia2KmJREffsX5YWYWWNqCN4HGujAn",
    "Qmb7zUM79h5JTBFBS5fVhvy9NNtPZtQcVirSpUDAgb7fNZ",
    "QmaRk9jADLHQyQatqU8CCYvrEZTyFMm9wDfpYyUo8xzHLJ",
    "QmWUYxUYcQFaifV8oBRpVL7WQ5V5vwELmYiUBRFLp8nkag",
    "QmXhL2m6dXa4kFme2vMkaP8BFMS7tRkDfidD29abtFsmj5",
    "QmTvL3cqgNxre7VxsfxneydTv5ndJXyfikfNiwKJnDxTTd",
    "QmQx31amkyPSJSFtn4pCCAbWbTa9Xbtn67EfnTYgHzcCif",
    "QmXFstG8xCkWkZfep8Uqi7Dmdt6YSvfAbEyiSv1mdGBadh",
    "Qmf2BfiBrDizQyaU3rwdaj1PqETXxmTQtxZwUyU7T4CveQ",
    "QmXjRGaCPTaH8DmRYTJGWnoAn5xccW1uQMzGtn7FAaADrd",
    "Qmb7cEUaJWLGrzNDW5UVt16Th7XNVeTmqbwhZTMwomtXVM",
    "Qma11BmAgee25u7viEvVhZG4GR8WFTUN1YKgi8BiJe3ciG",
    "QmSuoe5MkwgWLev7rtMuchijz8aeusQZaS7azCSg9Qww1g",
    "QmaZnTdHy5wgLfg7Xpix4YNLXVv6tr1wcYJ7tAhQKnPPta",
    "Qmb4UNHNCN7Tf2agDJdp2Es4pwnP3gvaoN757C1SbrX35t",
    "QmVkYs8GAfQGEAag12tCjiSQDzrw1M8XgHMZDD4cy7ukSQ",
    "QmVTXZzKAqnXKBXqwzwZtLNTUamThVn2KfBnuNSJNvgcFe",
    "QmTeL8shKnagknmhYQReaat9JyjJNiTPjVNt4DTz8paPZW",
    "Qmdeg7hmd6H5KcETDmWorFgozM6zvnaMSXggLGD57jR4yF",
    "QmTWjbf4xkyuPbeAXjMvB8kKEggTRM3wAiPY2f2GH7FjwH",
    "QmVnYqrvGzMZgPAPPrHC23jVoaHC2GwdXtiZJbZgP5Zu25",
    "QmXTpzcu5wZfpsycCgLUwLyVfFoDg719Z9REHq9W7GAhcA",
    "QmTk8nzNNZCsHDZhASgGizFTdhreqEd6Gi96h37BQ6V9W8",
    "QmWcwiE1R6jX8qTyA2YSuPS8pfhuDCNYMFUHv2y3yWsKDJ",
    "QmQh9wXaN4JatzJzvEagkspqY8Nhaz1dsRZX9j5hfRD41y",
    "QmNYCKgffjnw5qh12DuiT9jAhQzBGaTLpz1mhXxBJtwLGi",
    "QmQnHHM8Cbd3vmPHJG8gz5RMQvZd8wFFbKBG1szBrMGA4P",
    "QmRiksw6T4CdGS9cpyfk9y5yR2nbfBsYczHUqxDegqAvTD",
    "QmU3rizksTjcLhpqAx95ntpXdL4o59Nm6fKDRw5tz4djM6",
    "QmUt9CM3Mv9JviH5eBK5DWefmTj3iU2cEBkghkVjNCHwVM",
    "QmSaig6CrVTWHv74cqdZnGJVwpet9BfXeF17QJcZUF3EJh",
    "QmdrjJidGUkhz1C5PztcKkgjmSP1PGNdVbFdQiGhu1e41N",
    "QmebifvmPeACS5Z17nkhswLy3E26xJ7a9my4HDphVvzZmZ",
    "QmSif45tRfcNPHCkefPwv6GGoFarJYLXgNsp82TMsKnLXY",
    "QmQ4ZRsbvBJWA35bjQ27Ni79rYieYUJ1ADcB9MF61NMfMv",
    "QmeH3EtUmLaG4wnfPxTSV49w3yfDZeN71JWVQJqjRWMY6f",
    "QmRRCuKLopUApn6iQGuBWuvfzK1FKHjE3XwnreEmfLygMB",
    "QmVDYjmJr1JWZjBRQgY3tssjPUVsTDAKzKoLnX8zVaxAVZ",
    "QmXy7jGHhx7LgHyTW8qeU2r4tkAzFN1BRDquhcG7Zpuf7L",
    "QmTPnByBAWQmPSAU57kZe5gwCxogM8XbkGsZrGLQUUGgAK",
    "QmZ4XimZKrMhq9goRJahXxrNQWi4VfVrGxVmiuK13p2LrZ",
    "QmaRY9EhCkcHQdFh5nwkhWiza2sCiXfJ3JjzWm1w7EBn37",
    "QmRA54vVMg7AWsekfrS4AZjxRfno5boiSK3WMnVixWRo3m",
    "QmbALVMqF2EUyYQp3Uf2yRyMkh22vmCh6p3BiNeSTm839y",
    "Qmc9WyFC4ZNWRXz33pbZYLddxTgJmnQfLN7NfCRTyruxyC",
    "QmdKAvUjJV2H768WA6erBXcuAysnCB9kUztYEYA73i82QF",
    "QmbGYdcUw9s5xjG4Ke7WxpgYPgqFYWdKz7WvQhVJH3gNSs",
    "QmSmf56nZ3WY8DUigGZY1HeZdiMiZ97uV2W5g4di26Ywm9",
    "QmPSEkSsxD9MUwJT7mWL8AsZqCNjnFGLpGxsRxPnC93eWT",
    "QmVTHSqTe8bfewb9Xb5QHWWYjcVyaXmZijRULVdhoYpw47",
    "QmUVqyqBCeFn2oN9FL8vG2hLb8NKLGVmLDSpWhW3vKgVtH",
    "QmfRU2MoPuEV83JggwRvxV8CDrVGarp2cd4wR1ZciFwsCD",
    "QmU4KwkGmRUoAzzEmTmFRB4koRask5rx3weBVncvf4chGn",
    "QmUQXKYDPPAk29NwL4y3L9f6yDaQmaV6iN9cMQ3itrXVRV",
    "QmWB9WEKbkYFrm7FMZbzznjwYFTmpSqhCCnH5nc6oWxbGG",
    "QmcUorrFRqopz7yLzCGpp6vFMd1t1osxLpvx9AZn7ciAmm",
    "QmXdJ5cXLCdWmmyqRHQJ6JXQtZNDBeQGP2WVyrQYbP99X6",
    "QmNyUtTxdb5rqmN9SMJgZqf1kmt8uUPJEJJd6KfgMaioaA",
    "QmeXou2s9Kt8XW5qzWR5qDX42yurf9bmHm8z7MLytk3SSi",
    "QmYA8p6QGyYLakxqgCt8uypo2eYP4FMHGt4f86FF4VDgED",
    "QmQawf34jrQVcuLdtrTKAsSSPUsHHhzv7RXg6ZmjV6eYRh",
    "QmUUobcJgUXCCNtDejLVc2fY2gM4z6onMu8Ao2BLhUxnJp",
    "Qme2zntT74xasLYJ6XtQdsmL3PEySrkKkLBGrzr5aia3By",
    "QmXxUkwkvVmcwUgUVNMZY19dbyjm2s2KYq1dLRUDN3sJvT",
    "QmenAHKWaBKdZJj8tHfaP1B9KHW2eaXgFnGTH7gDazUBJC",
    "Qmc7dEZFecJutsXTZSEvBzSCCCLmdf5q4JaSDKAEYyRJT3",
    "QmQ2WhGzEoKBt81FKNT9narpqGUhTEC9rxUSjjutsvHeQi",
    "QmWjpuShUSBmGPFLmv7FcL3UqZ1hg8P3zboYH1ewfxwnGu",
    "QmfSpwHau8TiJuvQreaFQaGkQvh1GBCBhd4nfws1JGpdt4",
    "QmYjjQ4S4PJVfKNBTxgveqtgpY92WZsxsJ4SuQ5pyc5mMv",
    "Qmcjq1u7ck5FrgVQnE1eGu2c59viWw5cxt1eZCLqrD14pe",
    "QmUbXCNDEGE4VLrfgxUeGr6PF95xMNQ3oYGLbkNMMkqjAx",
    "QmVE1D3CsMT4yQf3PYASJjsgtYvh2tDC1WKfTatu7SESBs",
    "QmcotHL5tphamyMF1JAigcA4i6K1VsRo41YqANW4o6u6oT",
    "QmdrywmqZoeA2YWU9VCGEgWXwMFBLQJyLMoVJvyavw8Log",
    "QmdiXjUxTLfFHS6qEkbiYbxKWNZeTTVt93vVp7i7uk887j",
    "QmQehcyguxfJ9XmRYSJqWcstixcEfqrA9gXbx524VGYu2C",
    "QmPsJMUk35Vkfc3vtTSbffohiHECp2EyyG8ixRhJqME6GX",
    "QmVi3VDXnvdH2Y51G5uWyMfbBi2A4Mj7nCEY1mDdED441i",
    "QmPYvVZiux21TrCQqtK1rsQKFbbnsY1T1pDfonMu6f6Z3i",
    "QmT77pt8m9wGfgBsaLtc9MJWer5stiftiZLT6XuhZxFeyU",
    "QmUCs9TGnL7ZadpxxeieU8JkDgws8dnMahHng4vLR5QoYB",
    "QmZdV17Moy3HSee7MmE5fircqRPPH2Jazqr4TPvdm8ttc2",
    "QmRQM45ifPER3Hm3BM2xBiYAnrJ49kXjndaS2ku4PgbAKM",
    "QmRcvUXV62cHvCFTG5iSHUnqEAytrUe3gb2jdLRXUqLega",
    "QmVtq3UzrPtWRFMSEbARsYs34ugDwdsdF2aZrtcAMsX499",
    "QmQQuK16TzNvkargXaPAQWoPysFY62zEh1cBFYzBxvtCzC",
    "QmeVn8eqyrRgwZU9ZS4So3jSqkLE6G168JhujGSrhbjBkv",
    "QmUSEMGRjR8EpS2DvEyVYhAfUEmaEsAGWriJ4XR6XDPAVz",
    "QmbErcyk35PadyGdpdsEvSMTTMcTq4uqSzeYGg3SCioRuA",
    "QmPAsmh8dzLk6fK6cpmc58aFkbvTcTFKhLtr3R4Mi4bRYP",
    "QmNqNbq2fwXGicB1rXdgBdF4ZsHLqARRsBy44o782oiPd5",
    "QmYDdXtpgSCnyc5DdLBS1TGjLWr6ENKsx1F5Xupaoomzio",
    "QmdvE5oGqShqCQD8ioC64fNW9CxZfH275UZymsGfdXpieg",
    "QmUvfkLv35q9NsRZBWWs7EDjjHYWsSC8hnU4pDLJC7hFTa",
    "QmQZUDdewY9WY411iQbTQ9FwfpNaSdekKMQBfTBWctvE3G",
    "QmXbt84t8bK67A6WvAAG1hAA2YNV2kroJ2jqGoZBBgNEQu",
    "QmTJSTiW6BRajQ14qeCukyZBWkansa9QcmfcfWKpYDejdJ",
    "QmPGjWBtKCaDd6Tqmqf4TWay4qM7UgZnsKG5Xr7Vuyj1em",
    "QmV5p3ktTAwWKYFLEDqt2pPJv6UdeJE4wRPwRwsX7iDhbX",
    "Qmc8wUBFZRSBy4716BMCrqinU6M1R4DYUAkwPsTaGR5s1S",
    "QmXVe8XP6oKEPgW5MXzre78cE4zgm7nnxHbY5ud5hAMHih",
    "QmdiriE8o5AzQymqni4iZ6xhrFuzsQM3auosJJYeugyNzY",
    "Qmc1p7P38e6u36dgfWwBFvXa3uzaZjZNUae4fBRxspdd4B",
    "Qmc9oQznzhvksAasAkHDxaWm61HQx1voD88nJM1etktXzk",
    "QmXHkyCi4J5P3teTBYFcCwnnd4wDuZDnb57YZN2R75KvQW",
    "QmaPxVbLenmix572zsLGLJKfyeZ5Vbgro6AG1GAsKLNvyc",
    "QmeMzuQ7y52B4BmgfNdJ5Nx7Cj3jF3B38q7fSAuPM9rZz7",
    "QmfJLL9panrUwzVnZ5qW5AceEnXhfke6a2dMUcFm1cD3EP",
    "QmWenNSEq5UjAftkzH7tfdz1BD2yLpTe98dspSMghe6UMA",
    "QmXmQL3StxiH1EP5VP7p3XrqGtNaqpJ17Aki2Mr9Css5Hm",
    "QmT6YjyAZXuFRTzur4ZEzihFcpzW2zwb8hPSwHS7d4fLU8",
    "QmU4VEPT4JWDwa5qJmqVZ6HFSH2pJft4pU7zTUoasb48fG",
    "QmYi7Gkr5quA87711QVzY6bfWxHWLmL8L2KM5xwpiZY3nb",
    "QmWXbXY23aoBbRU98vpQ5JwwncjjC96ukfukx3C91pis1G",
    "QmaUoPvvugCtpkE3AYdgALTkhaWsereuZ71E8XU3fQjzHz",
    "QmVnXgzYvE1q8j7KAJBDqr7W7UPgAak313d7kuFa3jzfoP",
    "QmdDbTZniB2qkwq2Fqxc2VGK8hUTUWqwsLALfeNmVoNZjh",
    "QmPjuzQF92U3nULH1ptTWk6Bag5GoMB6ZgYBb8h6PthoAs",
    "QmfMP6gyGUJ1paN2xr8UwPcK8xvQt1zk8qYvTdrfbrpV4P",
    "QmZUy49CYBxCBg5BJuov5uqXzSp2JM3vtwNjcxiuDwRUBy",
    "QmZmxKY6vKvrdDxdGT7v2ft4fYYTxdtkBbVftN7W1tTa8K",
    "QmaK3RdvJccMhmCpLtaoJH7MKhfEsn3gLyzjZWhYgNFmKJ",
    "QmQTHuBpRsKtVvG44BF4uS5824ZiakbugwPQ6fpRaDzE33",
    "QmRHnViVToX5PQaQh1MnLW7vnCiALjYDYuUTyS7qGM3VF5",
    "QmXL883uzpKAH4whY9gphyf1i8VT4DnfftLCou7pmrEMTV",
    "QmRVqX9uXfL8Q6f8ncgqjed52NrubzVtdZywjGxoTf52Ud",
    "QmZgcR4hjxcdso14bKtoLgbP4cHNTzsPYx11junouBGT1M",
    "QmQfbuh3cWuiLa4bbEMMogZx4nWz2fh5j9SFqV3uxA84LJ",
    "QmXjNCT2r3DT9Bxb8q4zxGprVnsRMK3rRWez743fwNJ6na",
    "QmZS1r1hdtGAv8pCEfXGoXD7wTp3FeahtCmfDz2df55R3W",
    "QmZGVj3qSp3dicMCBRwShYFoA5PFzxZfBp4ra68iYj7Sdb",
    "QmTVoXmzdRHE6JHrAsUHdj4HqTYPToGFfhdJgoRS12UtKA",
    "QmS2fF6UzSXMLygahQigFEmWyVDUsLZLyeMnymaDn7QAay",
    "QmfRk2LT8MTmNfvhuwjb9RFinrAJ7WwBxQAXcXvwGpwPLT",
    "QmajvbRn92U9FRqEvPrtkJ7jrFTwX4QfCYYHeW3mhUxyqW",
    "QmZ71BPPdXsB9y1JQs8sLmcV1yiGpmWceb4wggZTU4LV4T",
    "QmShj49ZPBcTXvUrdRafuWDNNavVw3J6zMPVqvH1EBa9G3",
    "QmVZfyDzdocApiADKHsUX7f6GLFa9oFcLjyRBHzjsMjwmy",
    "QmWhB5UqLUuwfZMA11zcQezh6JdaehCbAKGjEUSocjoY9o",
    "QmSdR1Euxm5KemyYj6ZePZSisHjjukbwPGNdSwafnGAFua",
    "QmVs6HXbqRdWK1jH1nVBG71QneHYYsGa3pgcaWZiPkqy5y",
    "QmUfuBm7SU4Vsxz3CWtZ5KggfBbkeXL12fty3gaAPFdFE6",
    "QmVtBwFco6CNa3wriWdswNCUJwGRhDQhCjxYGtW3dWUAmA",
    "QmSK6F6i9nvqJgCaDfPFwZQ8tQATHKhagmRXF8t5TZU6BK",
    "QmeX9KjkwhB85YcXdxF99hDwr9J8fZ5p7EPBKt1foY4VqX",
    "Qmb44eom1fF1QFdbgFc9LzguRGrK8vkxrBo3PRBNibqW84",
    "QmajFmnQoNFwNDCyvG8nkRSfAXLstJbjAivhyVk6fJoNXH",
    "QmNhkSCcrJSFT9ApzWbo7ZTPMM3pp59ordcvKN6qxMi29r",
    "QmbCHAE91r1Jp7KmBAonYJ8wUBYXeGs9Kc1BoUYU1st7sh",
    "QmWrN65QRYFMNokHRkSoeZ1pbZXLupscqPKsUxw6LoFJ3X",
    "QmSF3kMHExf5Ztj5YPWkShzivJNZtXAZ4GhYPCKCohRPMb",
    "QmdX3GEzeKYbfMawMB4ifgNNkRbJuyk7bmrBM7YQRNbwhw",
    "Qmc9oE52y7xXFbF9ijPF4jE5Pw3yBjBzookp8C9ET8VfBZ",
    "QmRvhHoeQ2iLWZ393rjSZ1fEpFLPUsGkzPQwUpcdr53MeW",
    "QmUBd8neyh6Uhyfd5AA1kwgKYf4nbFXvY3j2pWpQc3e4Zi",
    "QmPHkSCcbVmELZM11Caa9T8oawv6Hx199JjtmYpNzGQJzx",
    "QmP6u52bRAYR7aT8r7MCxERRHUA37bvYAGaQYEoC6EXQ42",
    "QmSAzCHdEaJcZqbxHoCLTAA4qh8QbWHc4NNW4LRKMY43Zt",
    "QmUv2U7GfbVdARawGuWPN6P2evP5XpUFuyDtV829u2QfLb",
    "QmYznHqVhN3EkXS26ZFKJJum6zjhNtbUHqQjsgd51HLDu3",
    "QmdntzYpBT2HKb1mWZxxgnq23UpGVzm9VQ7CvWjamyU12J",
    "QmUnd49RDk7UPzgv9PRXpaSgUEcPai67kVbXgX1nnJn9rv",
    "QmRiNHNtwrtTXXWMN8XNaD8JuaCX7zbFZXkVCGCgH9r2Af",
    "QmSv2GHxmSkifvB4RDuT9LzuxpTTdbB5N3Jqp9GVN3zfXu",
    "QmQWTpCp854xXgV8ZVqbvKuXd8w4phXSWefMnt38Kd3kaM",
    "QmcM1GpqGKTGv1WKPbdtCDmQmnLb6kb9vkAAGcWUxBNsg2",
    "QmeCxqtrnVAURURcvC4keFk3mGRGeJbkqP8AGDb3LjPswh",
    "QmcxDdoQEZgFwGzGuGPQEpwk85ZFoyvU8rdCiwdYBX9nWd",
    "QmZSPR8EAtZPG7bj1R2fh1gWjxDd25qun9ZJtTYW9ynnvu",
    "QmdX7fguaysoQEy47c5v7xNaSFQH8GUoXfyWcR4vCJ3BKx",
    "QmeMzuQ7y52B4BmgfNdJ5Nx7Cj3jF3B38q7fSAuPM9rZz7",
    "QmSfNRSNHU7C41kMdykK8DhCbwKA92Y5qiyvL3KnXPQCWH",
    "QmWZtkDEEuLVqSiVzJVPVYW8NuAJkd4W1TuBZoGoWCUVkw",
    "QmVFXggV66gLJ3RMSdhRdRoS2BW5bNSqnFbnZNkeXQxmC7",
    "QmTt9dKPqyscesQGv69X3Ge1N2tXGiJbWzanaDWtHxCjnD",
    "Qmbg9pee5t6Thcyf2qnAtkRqh1qzw1XDMP8Gny3KoGjRG2",
    "Qmdb6KSgZYxakt1MxmuSduQmuogQkZFPNi7swEpPhH6MJ2",
    "QmebXyqeztWhgD6rcR9hU4Bs67LcZvq6KKgP3ev5SURS6i",
    "QmPXK3XjmAn4aLK9XmBYECyDz53jhasJrnU2yM9dLSEonF",
    "QmaFcrMo6WAFjjyidjtWexZDcsf5wDSA2sCgfncYiQ15Tn",
    "QmTtVHQGRoB8ocCgJoxUhBvTtfuRiYxS97S6hGeXiLYPUF",
    "QmZkrnd59NyU45a7iyDQyQfZJ5gcdMQh4w4Lextno9HW8T",
    "QmV7okyWPTzv4eQab3aaZUWkWfMcuF8wWQjWFk7UPEdWQy",
    "QmSZj2NzEGg2RP1Cbip4ye1D3GawMKHk1kasJxiQ6yue8t",
    "QmSgTnzsuv23GaZvi6ELqGoA8Bts2nUEW3dCwCWwL4guhS",
    "QmPK7tPBBEqhKQdemfb1FaT69sg68yQuiFQToNBWNyyRYr",
    "QmPwMhbZFc8PpGcXTgYvwHNURXdqjVSK7wiiqhERoTMQA4",
    "QmZCWENUcZM8tsfiKk9crs5hvWkVNkKeYt29CDucdu7q4m",
    "QmWaA6RHCPNwNVrzbcVgb89xpTYFzjfAoHHHtdCw21YoBc",
    "Qmc4APUfe1mxxmtnfH1FDRjR36DuFco82jLQ8Q3hPRK6p3",
    "QmXTmqivA6o17B3CMCKUcSYYk92sugE3p8mzaNYWJDDg4C",
    "QmfTAC8dEJmkT3gEnL2czMtpWqvyxhNDr4Rj53nMcaimCT",
    "QmPfCFWUYahCQ8Vx8p3GszFLSJxFsFfhpxpA9ApvEziDE1",
    "QmPWbLw7XUu2x16C4XaHMXjJepuWJZZJR1mHLDNMjiiiis",
    "QmWffXLxxAPvdtgQns9i9StpMra9x6fXeck8PS3WYkFevJ",
    "QmRZ5vRufMfwgAQ1LLdQ3CgC1uXy5WarYF99XEKK1icYJg",
    "QmRcRA6kQor9kJcUSnuT85YQvUKjXsYanqrRngdPMY4buh",
    "Qmf5AhHr4DxoZoE68CNy3Gr8KD2NxrgB34NCqtFnVpF74J",
    "QmNXnRHBxReEKspoW1HCwFqTgp7LGsTF69Vfiu5BpsMxBr",
    "QmRQPU5TDVSYBAPXZRCKB533SEKFuzkcRw35GFvg6tbgtb",
    "QmdZnEjFLp3Zp41ycBbvEp6NQRib3sq9hkN74ekhgEkJFx",
    "QmQg3YPgDrSrg2SVXgjGpsoEqnnEcYexL92fGVbVoaqTJR",
    "QmR5n894zPrWFh93DmoZKVgtJhUjyMmmjVybfb9T5YyyQe",
    "QmVtBwFco6CNa3wriWdswNCUJwGRhDQhCjxYGtW3dWUAmA",
    "QmU3z4wcrWeZsh3ZemgfYTZ7C2s7uQqVLqhMrmSPKWbeur",
    "QmSurBpuwYiipqaEQyb6aknhG2gVZjgFwzVeYnDH2HmnqU",
    "QmVUMYh4u9rvjR1bjjN95TJPumz5YJAmczYojz6s6eA6gR",
    "QmWp7YtQ4YnuSRcJHSnsNKqiAR8nsvD3shfXaLfCHmsvbv",
    "QmcUUGZmbPmGtYDssAgeTKwjomfL4vZzZf4CTgQmhzoFaA",
    "QmfJpNmEtEms9t3LnEtKMam8MdrnREYqZ4SjraQ9C1Q3JC",
    "QmU8xNFfirur4jxGnbtAC3cjdNQKTz7LTn1qV95nFay3Y5",
    "QmbetQN4E4cKjYin5shqmy7YFvTAZBUrR4Xhe1w1cMBq7m",
    "QmbUREZPsw8SdXDP1k69Thh51UfvsFgphd8QXSyHfEh3Sa",
    "QmdeJLFp6zx6YkA29zRQPcHmtn8Gg4wxu5Q3y4pYqnGSZg",
    "QmeEdU1quAvmmN31uYM8xKHwEJxzUaTZSQYTGK1z66wDcH",
    "QmNzQLQjcbJkr8K4u81QPig9gDg3cSfoXM7SB6dpqmubEv",
    "QmbCYpvyEk4BENw6ZMNzQMmip7pSCMuz3fiTmGunUSVqM8",
    "QmeHM4jmNQBueEuHYWFTdHet1rwocUKTyCSq3Dgq2vHZy4",
    "QmbTvZgTbBNLeTtJbCm2UGFY8pBqK1CfTN62zTxp3PNGfe",
    "QmRHWBZmZ2PPxLBtBA5JPvvKnkhFZtW5GoSDXiUShfTvYD",
    "QmUSJM8BKTAtoAUfmfyDPaUzUAPJmvq1MLKpwRh5sTWhB9",
    "QmZ8oC1ND5FV4fYuAB5ThNCqrML6fzYdd3BcJgStVZCep2",
    "QmT4zE5xvyzss9Erv8tsqtFhBh3SeGM4HEsUkTTUGhotqV",
    "QmZbSSg8hE84yLxBQ142h9BECKeroomBpxPE4j5qBVgcS1",
    "QmNabiMnLRrZWdMipY9JrcSoFhGK1YkqKydpH4q8S6SXwh",
    "QmXdQDC5G7L4hmJDPkBnF2eQXS7WwUt5gsJeyWyR76YUMp",
    "QmaQpUQL7K8pmFUp1UqQUycH8ZvET988o2GSn29aW2x9ym",
    "QmeKwyRLuEX9Nodo4YpynVBW7LM6ajP962UxrByQG6C87s",
    "QmQ9PVNj8aaAx3kGeJVnPwXVtD7Vwgd9eEv9dDY2AFkzs3",
    "Qmcxm4V8NcTEniamRTkFtLrxhvcKaUWRfnSgnDnHzAQw4T",
    "QmSUTe9m7uEV6XxqSgvNGByrHjmaoBRX1b2WwBQvQu4qoj",
    "QmVhkG8FoD2xgMCi6dHyocvgZEJCpYaeSf7AtjZoJ2kGpL",
    "QmVjXqYTtvTWGF2ZBybbyTWBsoSY8LXivrf6cuxgVMp2ma",
    "Qmby1frAHNDDd1MnKeQVpTzm2duPhi7876eePuUZ1aLBGb",
    "QmNNaSLor9RAss24WmHAcxsLPdbJZfTFr19bJhsAYXoVXn",
    "QmQTs9Nc6EfHUaQx5JQ2RmpLERzMmXcWBJjWHTNYATTvSy",
    "QmfPMftqWazSi2px8CUtirrizXEw3qn3dAeCkTGHx1wHov",
    "QmfB7MX6w98Vc2XFaLCwLUHzxkZiJboPiC9xMgbHGZwsmu",
    "QmYCAsfGebmRVjkxJHZZZ8VxB9zs99HBuEHm6kss5zjiyE",
    "QmXnGqMk5PoA3jjghyGm9hujEdYad3jAJkaxC3PyPVFgCd",
    "QmaSp6GawHr8unxj3sVhZ6ciE3v2Syqn7PmgAG5EcFkFWn",
    "QmaMGWSg5u1qogitXLWjeDTTd1kcaCrb7Zc2SyH2mkVAwD",
    "QmZBjiYFP6NinPh29PxjKuQJYNmVC7ZdEQ9otq77EkzfXg",
    "Qmd9CQSzwvmefMrE1MxLLYgBKLF882AVBbW44JwjtDWRqj",
    "QmfBsCiSEBby3AfgyAjQcBWj7Sjja4mvfhq5znpDLPqj6c",
    "QmZLvKioAYuvaK8xmqAfa7uzX4yFfstnPgZH54hwdNeyPG",
    "QmU7qXob7frPWCqW5q2C2cApmKZPb54ahTzgTzZ8PucMKv",
    "QmXKchjjDAtK44cyQiyg2bDv2kGsxeWbGtPM55mUCGWSnN",
    "QmPYghHK7nrP6mPuanbYrdxyR1FM68JHtZgbQ7WXbX77io",
    "QmduwtdYfQBQYcvHoJQ7ioB7ecqnMACikGNptr4ycNWtK2",
    "QmbDdV8R8C3q9t7x1KcUiBGHJd9Df5cmaCUdDy21Td723i",
    "Qmd4PHrvoHdTEsjhuJwp4iKpYNwFbMxs5rB1ni6mWo7e5g",
    "QmaXB39M3z3Fua2YQHJUNZ7mxT2Ci8o1PFZe6J2L8dTRCQ",
    "QmTFuCWmEYdFCqFY1JbFQDJETm69ovK3LwwS2Mby5KiE2Z",
    "QmQHmTSzkWjKpcPSoYdT6bhjods8DAwzwQ4y1iCd9D2fDa",
    "QmV9nDAGcA3sqFrmmQ7tmPrMuxuY7S11nCWmSUkBmcWfcs"
];

// // Files to be answered
// const tinyCids = [
//     "QmZpRvB6io4sZaALCEyjdVesH3YggckdZ1kRpSrFDV5dFf",
//     "QmebgH2vCcLDGQnwp48tSRirpLdGJs3rHtWdW3qyUMxakk",
//     "QmUMWiebt7gsagt49t4R8GXzQVL2YJ67i5SwffQL1pRMJ9",
//     "QmYgkjh2r3yYowh1QxMJRqUvdhjbgwt2MYWo3B1L76CC7Y",
//     "QmZnP2bFKtHxydwdAZ4BHHv9qYNTPjxME6QwJDjsBA4atB",
//     "QmRWoGvjsZqGfrXbtrzeBU1XESzrvMCJAWtkbHDGdNvbjU",
//     "QmXjztPbBDdavBs9RcyDvo1Zxg3owUJsZfXuSb2GHhAJWL",
//     "QmcKf7DPhy9wC9avsXVhd3XaNfkebF2BdLjGa9c4MUi6pw",
//     "QmYWgtk8u9Ut9V8J5uFdpWTso6qWYeXzQCfdNPY5335Fcv",
//     "Qmb9qNKXHKq4dzC1Yyo7rwV3fKS4BXKEDMJQwt8Fr2aPD2",
// ];

// const answers = ["cat", "dog"]

// // Concat image files with their index and Worker's provided answer
// const saltCids = tinyCids.map((x, idx) => x + idx.toString() + answers[idx % 2]) 

// // Hash the leaves
// const leaves = saltCids.map((x) => keccak(x))

// // Build the tree
// const tree = new MerkleTree(leaves, keccak);

// // Root is the top-level hash of the tree
// const root = tree.getRoot().toString('hex')

// // Worker submits root to Smart Contract. 
// // Contract randomly audits indexes. Audit comes back, file 4 was audited. 

// // Worker creates proof that the leaf at index 4 contains the answer "cat".
// const leaf = keccak("QmZnP2bFKtHxydwdAZ4BHHv9qYNTPjxME6QwJDjsBA4atB" + "4" + "cat").toString()
// const proof = tree.getProof(leaf);
// console.log(proof);
// console.log(tree.verify(proof, leaf, root)) // Returns True

// ///
// // If Worker submits wrong answer
// const badAnswerLeaf = keccak("QmZnP2bFKtHxydwdAZ4BHHv9qYNTPjxME6QwJDjsBA4atB" + "4" + "dog").toString()
// const badAnswerProof = tree.getProof(badAnswerLeaf);
// console.log(tree.verify(badAnswerProof, badAnswerLeaf, root)) // Returns False

// // If Worker submits wrong index
// const badIndexLeaf = keccak("QmZnP2bFKtHxydwdAZ4BHHv9qYNTPjxME6QwJDjsBA4atB" + "3" + "cat").toString()
// const badIndexProof = tree.getProof(badIndexLeaf);
// console.log(tree.verify(badIndexProof, badIndexLeaf, root)) // Returns False
// // etc
// ///


function strToUtf8Bytes(str) {
    const utf8 = [];
    for (let ii = 0; ii < str.length; ii++) {
      let charCode = str.charCodeAt(ii);
      if (charCode < 0x80) utf8.push(charCode);
      else if (charCode < 0x800) {
        utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
      } else if (charCode < 0xd800 || charCode >= 0xe000) {
        utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
      } else {
        ii++;
        // Surrogate pair:
        // UTF-16 encodes 0x10000-0x10FFFF by subtracting 0x10000 and
        // splitting the 20 bits of 0x0-0xFFFFF into two halves
        charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff));
        utf8.push(
          0xf0 | (charCode >> 18),
          0x80 | ((charCode >> 12) & 0x3f),
          0x80 | ((charCode >> 6) & 0x3f),
          0x80 | (charCode & 0x3f),
        );
      }
    }
    return utf8;
  }

const leaves = cids.map(x => keccak(x, {outputLength: 256}));
const tree = new MerkleTree(leaves, keccak);
const root = tree.getRoot().toString('hex');
const rootHash = keccak(root, {outputLength: 256}).toString();
console.log(root);
console.log(strToUtf8Bytes(rootHash).length)

// const leaf = keccak(cids[0]).toString();

// console.log(byteSize(leaf))

// const proof = tree.getProof(leaf)

// console.log(byteSize(proof[0].data));

// console.log("Merkle Proof JS: ", tree.verify(proof, leaf, root))
