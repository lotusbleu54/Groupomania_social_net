                if (json[i].link) {
                  let newP = document.createElement("p");
                  let newA = document.createElement("a");
                  newA.href = json[i].link;
                  newA.textContent = json[i].link;
                  newP.appendChild(newA);
                  newDiv.appendChild(newP);
                }