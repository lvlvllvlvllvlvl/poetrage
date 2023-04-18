The problem of calculating the expected value of repeatedly using regrading lenses on a gem is similar to the following [puzzle](https://math.stackexchange.com/questions/2521890/probability-brain-teaser-with-infinite-loop) found on stackexchange:

> A miner is trapped in a mine containing 3 doors. The first door leads to a tunnel that will take him to safety after 3 hours of travel. The second door leads to a tunnel that will return him to the mine after 5 hours of travel. The third door leads to a tunnel that will return him to the mine after 7 hours. If we assume that the miner is at all times equally likely to choose any one of doors, what is the expected length of time until he reaches safety?

l use the [approach provided by Ross Millikan](https://math.stackexchange.com/a/2521908/1171227) to solve it:

> Let $t$ be the expected time to get out. If he takes the second or third door he returns to the same position as the start, so the expected time after he returns is $t$. Therefore we have


 $$ t = \frac 1 3 (3) + \frac 1 3 (t+5) + \frac 1 3 (t+7) $$
 $$ \frac 1 3 t = 5 $$
 $$ t = 15 $$

Each alternate quality gem is considered a room of the mine if it is profitable to reroll that gem, or an exit if you would rather sell it. The travel distance is the cost of a regrading lens, which we will be treating as a negative number, while the profit earned from selling a gem will be positive. We will use the letter $v$ for the value of the gems instead of $t$, and as the probabilities of rolling different qualities can vary, we will replace the $\frac 1 3$ with the actual probabilities.

So for instance, Boneshatter, which has 50 weight for Superior and Anomalous, and 10 weight for Divergent, we would have

$$ v_{superior} = \frac 5 6 (v_{anomalous} - v_{lens}) + \frac 1 6 (v_{divergent} - v_{lens}) $$
$$ v_{anomalous} = \frac 5 6 (v_{superior} - v_{lens}) + \frac 1 6 (v_{divergent} - v_{lens}) $$
$$ v_{divergent} = 400c $$
$$ v_{lens} = 40c $$

Substituting into the top equation we get
$$ v_{s} = \frac 5 6 (\frac 5 6 (v_{s} - v_{lens}) + \frac 1 6 (v_{d} - v_{lens}) - v_{lens}) + \frac 1 6 (v_{d} - v_{lens}) $$
$$ v_{s} = \frac 5 6 (\frac 5 6 (v_{s} - 40) + 60 - 40) + 60 $$
$$ \frac {11} {36} v_s = - \frac {25} {36} 40 + \frac 5 6 20 + 60 $$
$$ 11 v_s = - 1000 + 600 + 2160 $$
$$ v_s = 160 $$

So our expected profit from this gamble is 160 chaos. As a sanity check, we can consider that in this case where the chance of cashing out is 1 in 6 from either quality type, so this is equivalent to rolling a die until you get a 6, [which will on average take 6 tries](https://math.stackexchange.com/questions/42930/what-is-the-expected-value-of-the-number-of-die-rolls-necessary-to-get-a-specifi), and our profit is equal to the value of the divergent gem minus the cost of 6 regrading lenses.

To solve this using gaussian elimination we convert the system of equations into a matrix:

$$ v_{s} - \frac 5 6 v_{a} - \frac 1 6 v_{d} = - 40 $$
$$ - \frac 5 6 v_{s} + v_{a} - \frac 1 6 v_{d} = - 40 $$
$$ v_{d} = 400c $$

becomes
```
[
    [1, 5/6, 1/6, -40],
    [-5/6, 1, -1/6, -40],
    [0, 0, 1, 400]
]
```
