package models

type Player struct {
	Name      string    `json:"name" bson:"name"`
	Attacking Attacking `json:"attacking" bson:"attacking"`
	Defending Defending `json:"defending" bson:"defending"`
}

type PlayerAction struct {
	Type  string `json:"type"`
	Value int    `json:"value"`
}

type Attacking struct {
	Point    int `json:"point" bson:"point"`
	Caught   int `json:"caught" bson:"caught"`
	Short    int `json:"short" bson:"short"`
	Frame    int `json:"frame" bson:"frame"`
	Footing  int `json:"footing" bson:"footing"`
	Landed   int `json:"landed" bson:"landed"`
	BadPass  int `json:"badPass" bson:"badPass"`
	DropPass int `json:"dropPass" bson:"dropPass"`
}

type Defending struct {
	FirstLine  int `json:"first" bson:"first"`
	SecondLine int `json:"second" bson:"second"`
	Drop       int `json:"drop" bson:"drop"`
	Gap        int `json:"gap" bson:"gap"`
	Dig        int `json:"dig" bson:"dig"`
}

func (p *Player) AddAction(action PlayerAction) {
	switch action.Type {
	case "point":
		p.Attacking.Point = max(0, p.Attacking.Point+action.Value)
	case "caught":
		p.Attacking.Caught = max(0, p.Attacking.Caught+action.Value)
	case "short":
		p.Attacking.Short = max(0, p.Attacking.Short+action.Value)
	case "frame":
		p.Attacking.Frame = max(0, p.Attacking.Frame+action.Value)
	case "footing":
		p.Attacking.Footing = max(0, p.Attacking.Footing+action.Value)
	case "landed":
		p.Attacking.Landed = max(0, p.Attacking.Landed+action.Value)
	case "bad pass":
		p.Attacking.BadPass = max(0, p.Attacking.BadPass+action.Value)
	case "drop pass":
		p.Attacking.DropPass = max(0, p.Attacking.DropPass+action.Value)
	case "1st":
		p.Defending.FirstLine = max(0, p.Defending.FirstLine+action.Value)
	case "2nd":
		p.Defending.SecondLine = max(0, p.Defending.SecondLine+action.Value)
	case "drop":
		p.Defending.Drop = max(0, p.Defending.Drop+action.Value)
	case "gap":
		p.Defending.Gap = max(0, p.Defending.Gap+action.Value)
	case "dig":
		p.Defending.Dig = max(0, p.Defending.Dig+action.Value)
	}
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
