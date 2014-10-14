var swig = require('swig')
var path = require('path')
var EventEmitter = require('events').EventEmitter

var treeTemplate = swig.compileFile(path.join(__dirname,"tree.svg"))

var SvgTree = module.exports = function SvgTree(opts) {
  opts = opts || {}
  opts.cellWidth = opts.cellWidth || 20
  opts.cellHeight = opts.cellHeight || 20
  opts.cellBorder = opts.cellBorder || 4
  opts.cellPadding = opts.cellpadding || 2
  this.opts = opts
  this.cells = []
  this.edges = []
  this.rows = 0
  this.cols = 0
}

SvgTree.prototype = Object.create(EventEmitter.prototype)
SvgTree.prototype.constructor = SvgTree


SvgTree.prototype.CreateCell = function CreateCell(opts) {
  var cell = new EventEmitter()
  cell.x = opts.x = opts.x || 0
  cell.y = opts.y = opts.y || 0
  cell.rune = opts.rune = opts.rune || " "
  if(this.rows < cell.x) this.rows = opts.x
  if(this.cols < cell.y) this.cols = opts.y
  cell.index = this.cells.push(cell)-1
  return cell
}

SvgTree.prototype.addEdge = function addEdge(i1,i2) {
  this.edges.push({"0":i1,"1":i2})
}

SvgTree.prototype.renderEdges = function renderEdges() {
  var cells = this.cells
  var result = []
  this.edges.forEach(function(v) {
    var c1 = cells[v["0"]]
    var c2 = cells[v["1"]]
    if(c1.x===c2.x) { // only need 1 vertical line
      return result.push({"x1":c1.x,"y1":c1.y,"x2":c2.x,"y2":c2.y})
    }
    if(c1.y===c2.y) { //only need 1 horizontal line
      return result.push({"x1":c1.x,"y1":c1.y,"x2":c2.x,"y2":c2.y})
    }
    //else we will need 3 lines
    var midy = (c1.y + c2.y) / 2
    result.push({"x1":c1.x,"y1":c1.y,"x2":c1.x,"y2":midy})
    result.push({"x1":c1.x,"y1":midy,"x2":c2.x,"y2":midy})
    result.push({"x1":c2.x,"y1":midy,"x2":c2.x,"y2":c2.y})
  })
  return result
}

SvgTree.prototype.compile = function compile(div) {
  var opts = this.opts,
      cells = this.cells,
      cellWidth = opts.cellWidth,
      cellHeight = opts.cellHeight,
      cellBorder = opts.cellBorder,
      cellPadding = opts.cellPadding,
      rows = this.rows+1, // 0 based grid
      cols = this.cols+1, // 0 based grid
      edges = this.renderEdges()

  var template = {
    "cells":cells,
    "width":(cellWidth+cellBorder+cellPadding)*rows-(cellPadding-2),
    "height":(cellHeight+cellBorder+cellPadding)*cols-(cellPadding-2),
    "cellwidth":cellWidth,
    "cellheight":cellHeight,
    "cellborder":cellBorder,
    "tcwidth":(cellWidth+cellBorder+cellPadding),
    "tcheight":(cellHeight+cellBorder+cellPadding),
    "edges":edges
  }

  var svg = treeTemplate(template)
  if(div) {
    div.innerHTML = svg
    var nodes = div.firstChild.querySelectorAll("rect.cell,text.cell")
    Array.prototype.forEach.call(nodes,function(v) {
      var cell = cells[v.getAttribute("cell")]
      v.addEventListener("click",function() {
        cell.emit("click")
      })
      v.addEventListener("mouseover",function() {
        cell.emit("hover")
      })
    })
  }
  return svg
}
