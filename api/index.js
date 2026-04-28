/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ahamuyel <ahamuyel@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/27 18:27:19 by ahamuyel          #+#    #+#             */
/*   Updated: 2026/04/27 18:27:20 by ahamuyel         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import express from "express";

const app = express();
const PORT = 4200;

app.get("/", (req, res) => {
  res.json({
    message: "Hello from Cur10usX in a container!",
    service: "Hello-node",
    pod: process.env.POD_NAME || "unknown",
    time: new Date().toISOString(),
  });
});

app.get('/readyz', (req, res)=> res.status(200).send('ready'))
app.get('/healthz', (req, res)=> res.status(200).send('ok'))

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
