import svgwrite
import json
import os

rootDir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

input_file = ''
outfile = os.path.join(rootDir, 'heatmap/heatmap.svg')
canvas_height = '600px'
canvas_width = '1200px'

def createRect(canvas, x, y, size, color):
    canvas.add(canvas.rect(insert=(x,y), size=size, fill = color))

def parseData(filename):
    with open(filename, 'r') as infile:
        data = json.load(infile)    
    return data 

def labelYaxis(canvas):
    y_offset = 50
    y_start = 210
    x_start = 30
    continentes = ['Africa', 'Europa', 'America', 'Asia', 'Oceania']
    for continente in continentes:
        canvas.add(canvas.text(text=continente, insert=(x_start, y_start)))
        y_start += y_offset

def labelXaxis(canvas):
    x_offset = 70
    x_start = 120
    y_start = 480
    for religion in data['Religions']:
        text = canvas.text(text=religion, insert=(x_start, y_start))
                            #    style='transform:rotate(10deg) translate(50px, 0px)')
        canvas.add(text)
        x_start += x_offset

def drawAxis(canvas):
    y_axis = [(90,150), (90, 450)]
    x_axis = [(90, 450), (850, 450)]
    
    canvas.add(canvas.line(start=y_axis[0], end=y_axis[1], stroke="black", stroke_width = 3))
    canvas.add(canvas.line(start=x_axis[0], end=x_axis[1] ,stroke="black", stroke_width = 3))
    
def getColors(data, religion, continente):
    # color 1 es mas claro y 6 mas oscuro
    colors = {1 : 'rgb(254, 236, 108)', 2: 'rgb(249, 204, 41)', 3:'rgb(252, 154, 43)' , 4:'rgb(232, 80, 4)' , 5:'rgb(188,21,12)' ,6:'rgb(166, 37, 16)' }
    segmentos = [round(100*i/6, 2) for i in range(7)]

    pop_continente = data['Population'][continente]
    pop_religion_continente = data['PracticantesPerContinent'][continente][religion]

    percent = (pop_religion_continente / pop_continente) * 100

    for i in range(len(segmentos) - 1):
        if percent == 0:
            return colors[1]

        if percent > segmentos[i] and percent <= segmentos[i+1]:
            print(percent)
            print(colors[i+1])
            return colors[i+1]

        
def drawRect(canvas, x, y, height, width, color):
    canvas.add(canvas.rect(insert=(x,y), size=(width,height), fill=color))

def drawHeatmap(canvas, data):
    # dibujamos los 50 rectangulos 
    rect_height = 55
    rect_width = 70
    x_start = 110
    y_start = 175
    x_offset = 70
    y_offset = 55
    continentes = ['africa', 'europe', 'america', 'asia', 'oceania']

    for religion in data['Religions']:
        for continente in continentes:
            color = getColors(data, religion, continente)
            print(continente, religion)
            drawRect(canvas, x_start, y_start, rect_height, rect_width, color)
            y_start += y_offset
        y_start = 175
        x_start += x_offset

if __name__ == "__main__":
    data = parseData(os.path.join(rootDir, 'processed_data/heatmap.json'))
    drw = svgwrite.Drawing(outfile, size=(canvas_width, canvas_height))
    print(data)
    # Creamos los ejes 
    drawAxis(drw)    

    # ponemos nombre al eje y
    labelYaxis(drw)
    labelXaxis(drw)

    drawHeatmap(drw, data)
    

    drw.save()
